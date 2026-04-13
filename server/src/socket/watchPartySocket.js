import { Server, Socket } from 'socket.io';
import { prisma } from '../lib/prisma.js';
import { WatchPartyStatus, WatchPartyMessageType } from '@prisma/client';
export const setupWatchPartySocket = (io, socket) => {
    let currentRoomCode = null;
    let currentUserId = null;
    socket.on('wp:join', async ({ code, userId }) => {
        try {
            const party = await prisma.watchParty.findUnique({
                where: { code },
                include: { host: true }
            });
            if (!party) {
                socket.emit('wp:error', { message: 'Room not found' });
                return;
            }
            // Check max participants
            const participantCount = await prisma.watchPartyParticipant.count({
                where: { partyId: party.id }
            });
            if (participantCount >= party.maxParticipants) {
                // Check if user is already a participant (re-joining)
                const existing = await prisma.watchPartyParticipant.findUnique({
                    where: { partyId_userId: { partyId: party.id, userId } }
                });
                if (!existing) {
                    socket.emit('wp:error', { message: 'Room is full' });
                    return;
                }
            }
            currentRoomCode = code;
            currentUserId = userId;
            socket.join(`wp_${code}`);
            // Upsert status
            await prisma.watchPartyParticipant.upsert({
                where: { partyId_userId: { partyId: party.id, userId } },
                create: { partyId: party.id, userId, isReady: false },
                update: { joinedAt: new Date() }
            });
            // Get all participants
            const participants = await prisma.watchPartyParticipant.findMany({
                where: { partyId: party.id },
                include: { user: { select: { id: true, username: true, avatar: true } } }
            });
            // Send current state
            io.to(`wp_${code}`).emit('wp:state-update', {
                participants,
                status: party.status,
                currentTimestamp: party.currentTimestamp,
                episodeNumber: party.episodeNumber
            });
            // Broadcast system message
            const systemMsg = await prisma.watchPartyMessage.create({
                data: {
                    partyId: party.id,
                    userId,
                    content: 'joined the party',
                    messageType: 'SYSTEM'
                },
                include: { user: { select: { username: true, avatar: true } } }
            });
            io.to(`wp_${code}`).emit('wp:chat-message', systemMsg);
        }
        catch (error) {
            console.error('[WP] Join error:', error);
        }
    });
    socket.on('wp:ready', async ({ code, userId, isReady }) => {
        try {
            const party = await prisma.watchParty.findUnique({ where: { code } });
            if (!party)
                return;
            await prisma.watchPartyParticipant.update({
                where: { partyId_userId: { partyId: party.id, userId } },
                data: { isReady }
            });
            // Broadcast updated participants list
            const participants = await prisma.watchPartyParticipant.findMany({
                where: { partyId: party.id },
                include: { user: { select: { id: true, username: true, avatar: true } } }
            });
            io.to(`wp_${code}`).emit('wp:participants-update', participants);
        }
        catch (error) {
            console.error('[WP] Ready status error:', error);
        }
    });
    socket.on('wp:sync', async ({ code, status, currentTimestamp, episodeNumber }) => {
        try {
            const party = await prisma.watchParty.findUnique({ where: { code } });
            if (!party)
                return;
            // In a real app, verify hostId here
            // if (party.hostId !== currentUserId) return;
            await prisma.watchParty.update({
                where: { id: party.id },
                data: { status, currentTimestamp, episodeNumber }
            });
            // Broadcast to all
            io.to(`wp_${code}`).emit('wp:state-update', { status, currentTimestamp, episodeNumber });
        }
        catch (error) {
            console.error('[WP] Sync error:', error);
        }
    });
    socket.on('wp:chat', async ({ code, userId, content }) => {
        try {
            const party = await prisma.watchParty.findUnique({ where: { code } });
            if (!party)
                return;
            const message = await prisma.watchPartyMessage.create({
                data: {
                    partyId: party.id,
                    userId,
                    content,
                    messageType: 'CHAT'
                },
                include: { user: { select: { username: true, avatar: true } } }
            });
            io.to(`wp_${code}`).emit('wp:chat-message', message);
        }
        catch (error) {
            console.error('[WP] Chat error:', error);
        }
    });
    socket.on('wp:reaction', async ({ code, userId, reaction }) => {
        try {
            const party = await prisma.watchParty.findUnique({ where: { code } });
            if (!party)
                return;
            // Reactions are transient, don't necessarily need DB storage unless history is required
            io.to(`wp_${code}`).emit('wp:reaction-broadcast', { userId, reaction });
        }
        catch (error) {
            console.error('[WP] Reaction error:', error);
        }
    });
    socket.on('wp:leave', async ({ code, userId }) => {
        handleLeave(code, userId);
    });
    socket.on('disconnect', () => {
        if (currentRoomCode && currentUserId) {
            handleLeave(currentRoomCode, currentUserId);
        }
    });
    async function handleLeave(code, userId) {
        try {
            const party = await prisma.watchParty.findUnique({ where: { code } });
            if (party) {
                await prisma.watchPartyParticipant.delete({
                    where: { partyId_userId: { partyId: party.id, userId } }
                }).catch(() => { });
                io.to(`wp_${code}`).emit('wp:member-left', { userId });
            }
            socket.leave(`wp_${code}`);
        }
        catch (error) {
            // Silence expected errors on disconnect
        }
    }
};
//# sourceMappingURL=watchPartySocket.js.map