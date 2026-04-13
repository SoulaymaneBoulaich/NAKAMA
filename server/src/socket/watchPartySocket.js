import { Server, Socket } from 'socket.io';
import { prisma } from '../lib/prisma.js';
export const setupWatchPartySocket = (io, socket) => {
    // Current room the socket is in
    let currentRoomCode = null;
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
            currentRoomCode = code;
            socket.join(`wp_${code}`);
            // Upsert member status
            await prisma.watchPartyMember.upsert({
                where: { partyId_userId: { partyId: party.id, userId } },
                create: { partyId: party.id, userId },
                update: { lastOnlineAt: new Date() }
            });
            // Get all members
            const members = await prisma.watchPartyMember.findMany({
                where: { partyId: party.id },
                include: { user: { select: { username: true, avatar: true } } }
            });
            io.to(`wp_${code}`).emit('wp:member-joined', {
                members,
                partyState: {
                    status: party.status,
                    currentTime: party.currentTime,
                    episode: party.episode
                }
            });
            console.log(`User ${userId} joined watch party ${code}`);
        }
        catch (error) {
            console.error('Watch party join error:', error);
        }
    });
    socket.on('wp:sync', async ({ code, status, currentTime, episode }) => {
        // Only host should ideally control this, but for simplicity we'll allow anyone for now 
        // or check hostId in a real prod app.
        try {
            await prisma.watchParty.update({
                where: { code },
                data: { status, currentTime, episode }
            });
            // Broadcast to everyone else in the room
            socket.to(`wp_${code}`).emit('wp:state-update', { status, currentTime, episode });
        }
        catch (error) {
            console.error('Watch party sync error:', error);
        }
    });
    socket.on('wp:chat', ({ code, message, user }) => {
        io.to(`wp_${code}`).emit('wp:chat-message', {
            id: Date.now().toString(),
            message,
            user,
            createdAt: new Date().toISOString()
        });
    });
    socket.on('wp:leave', async ({ code, userId }) => {
        socket.leave(`wp_${code}`);
        currentRoomCode = null;
        // Broadcast departure
        socket.to(`wp_${code}`).emit('wp:member-left', { userId });
    });
    socket.on('disconnect', () => {
        if (currentRoomCode) {
            // Option: mark as offline in DB
        }
    });
};
//# sourceMappingURL=watchPartySocket.js.map