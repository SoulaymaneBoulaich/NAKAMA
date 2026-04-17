import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// WatchParty Namespace Socket
export const watchPartySocket = io(`${SOCKET_URL}/watchparty`, {
    withCredentials: true,
    autoConnect: false
});

// Arena Namespace Socket (for AniJudge/AniQuiz)
export const arenaSocket = io(`${SOCKET_URL}/arena`, {
    withCredentials: true,
    autoConnect: false
});

// Messaging Namespace Socket
export const messagingSocket = io(`${SOCKET_URL}/messaging`, {
    withCredentials: true,
    autoConnect: false
});
