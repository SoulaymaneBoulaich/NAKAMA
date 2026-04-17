import { Server, Socket } from 'socket.io';
import { prisma } from '../lib/prisma.js';
import { WatchPartyStatus } from '@prisma/client';

export const setupWatchPartySocket = (io: Server, socket: Socket) => {
  let currentRoomCode: string | null = null;
  let currentUserId: string | null = null;

  socket.on('join-party', async ({ code, userId }: { code: string; userId: string }) => {
    try {
      const party = await prisma.watchParty.findUnique({
        where: { code },
        include: { host: true }
      });

      if (!party) {
        socket.emit('party-error', { message: 'ROOM SIGNAL NOT FOUND' });
        return;
      }

      const participantCount = await prisma.watchPartyParticipant.count({
        where: { partyId: party.id }
      });

      if (participantCount >= party.maxParticipants) {
        const existing = await prisma.watchPartyParticipant.findUnique({
          where: { partyId_userId: { partyId: party.id, userId } }
        });
        if (!existing) {
          socket.emit('party-error', { message: 'ROOM IS AT MAXIMUM CAPACITY' });
          return;
        }
      }

      currentRoomCode = code;
      currentUserId = userId;
      const roomName = `party:${code}`;
      socket.join(roomName);

      // Join/Update record
      await prisma.watchPartyParticipant.upsert({
        where: { partyId_userId: { partyId: party.id, userId } },
        create: { partyId: party.id, userId, isReady: userId === party.hostId },
        update: { joinedAt: new Date() }
      });

      // Update room state
      const participants = await prisma.watchPartyParticipant.findMany({
        where: { partyId: party.id },
        include: { user: { select: { id: true, username: true, avatar: true } } }
      });

      io.to(roomName).emit('participants-list', participants);
      
      socket.emit('party-state', {
        status: party.status,
        currentTimestamp: party.currentTimestamp,
        episodeNumber: party.episodeNumber,
        animeTitle: party.animeTitle,
        animeCover: party.animeCover
      });

      // System notification
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
      const systemMsg = await prisma.watchPartyMessage.create({
        data: {
          partyId: party.id,
          userId,
          content: `${user?.username || 'ANONYMOUS'} HAS MANIFESTED`,
          messageType: 'SYSTEM'
        },
        include: { user: { select: { username: true, avatar: true } } }
      });
      io.to(roomName).emit('new-message', systemMsg);

    } catch (error) {
      console.error('[WP] JOIN ERROR:', error);
    }
  });

  socket.on('ready-up', async ({ code, userId, isReady }: { code: string; userId: string; isReady: boolean }) => {
    try {
      const party = await prisma.watchParty.findUnique({ where: { code } });
      if (!party) return;

      await prisma.watchPartyParticipant.update({
        where: { partyId_userId: { partyId: party.id, userId } },
        data: { isReady }
      });

      const participants = await prisma.watchPartyParticipant.findMany({
        where: { partyId: party.id },
        include: { user: { select: { id: true, username: true, avatar: true } } }
      });
      io.to(`party:${code}`).emit('participants-list', participants);
    } catch (error) {
      console.error('[WP] READY ERROR:', error);
    }
  });

  socket.on('sync-playback', async ({ code, status, currentTimestamp, episodeNumber }: { 
    code: string; 
    status: WatchPartyStatus; 
    currentTimestamp: number;
    episodeNumber?: number;
  }) => {
    try {
      const party = await prisma.watchParty.findUnique({ where: { code } });
      if (!party || party.hostId !== currentUserId) return;

      await prisma.watchParty.update({
        where: { id: party.id },
        data: { status, currentTimestamp, episodeNumber }
      });

      io.to(`party:${code}`).emit('party-state', { 
        status, 
        currentTimestamp, 
        episodeNumber,
        animeTitle: party.animeTitle,
        animeCover: party.animeCover
      });
    } catch (error) {
      console.error('[WP] SYNC ERROR:', error);
    }
  });

  socket.on('broadcast-message', async ({ code, userId, content }: { code: string; userId: string; content: string }) => {
    try {
      const party = await prisma.watchParty.findUnique({ where: { code } });
      if (!party) return;

      const message = await prisma.watchPartyMessage.create({
        data: {
          partyId: party.id,
          userId,
          content,
          messageType: 'CHAT'
        },
        include: { user: { select: { username: true, avatar: true } } }
      });

      io.to(`party:${code}`).emit('new-message', message);
    } catch (error) {
      console.error('[WP] CHAT ERROR:', error);
    }
  });

  socket.on('floating-reaction', async ({ code, userId, reaction }: { code: string; userId: string; reaction: string }) => {
    io.to(`party:${code}`).emit('reaction-event', { userId, reaction });
  });

  socket.on('leave-party', async ({ code, userId }: { code: string, userId: string }) => {
    handleLeave(code, userId);
  });

  socket.on('disconnect', () => {
    if (currentRoomCode && currentUserId) {
      handleLeave(currentRoomCode, currentUserId);
    }
  });

  async function handleLeave(code: string, userId: string) {
    try {
      const party = await prisma.watchParty.findUnique({ where: { code } });
      if (party) {
        await prisma.watchPartyParticipant.delete({
          where: { partyId_userId: { partyId: party.id, userId } }
        }).catch(() => {});

        io.to(`party:${code}`).emit('member-quit', { userId });
      }
      socket.leave(`party:${code}`);
    } catch (error) {}
  }
};
