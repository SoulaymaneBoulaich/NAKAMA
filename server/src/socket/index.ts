import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';
import { setupArenaSocket } from './arenaSocket.js';
import { setupMessagingSocket } from './messagingSocket.js';
import { setupWatchPartySocket } from './watchPartySocket.js';
import { setupBattleSocket } from './battleSocket.js';


export const initSocket = (httpServer: HttpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    // Main connection for general events
    io.on('connection', (socket) => {
        console.log(`User connected to main: ${socket.id}`);
        socket.on('disconnect', () => {
            console.log(`User disconnected from main: ${socket.id}`);
        });
    });

    // Namespace: Watch Party
    const watchPartyNamespace = io.of('/watchparty');
    watchPartyNamespace.on('connection', (socket) => {
        console.log(`User joined /watchparty: ${socket.id}`);
        setupWatchPartySocket(watchPartyNamespace as any, socket);
    });

    // Namespace: Arena (AniJudge)
    const arenaNamespace = io.of('/arena');
    arenaNamespace.on('connection', (socket) => {
        setupArenaSocket(arenaNamespace as any, socket);
    });

    const messagingNamespace = io.of('/messaging');
    messagingNamespace.on('connection', (socket) => {
        setupMessagingSocket(messagingNamespace as any, socket);
    });

    // Namespace: Battle (AniQuiz 1v1)
    const battleNamespace = io.of('/battle');
    battleNamespace.on('connection', (socket) => {
        setupBattleSocket(battleNamespace as any, socket);
    });

    return io;
};
