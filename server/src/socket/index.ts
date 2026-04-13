import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';
import { setupArenaSocket } from './arenaSocket.js';
import { setupMessagingSocket } from './messagingSocket.js';
import { setupWatchPartySocket } from './watchPartySocket.js';


export const initSocket = (httpServer: HttpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        setupArenaSocket(io, socket);
        setupMessagingSocket(io, socket);
        setupWatchPartySocket(io, socket);

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });

    return io;
};
