import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let arenaSocketInstance: Socket | null = null;

export const useArenaSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(arenaSocketInstance);

    useEffect(() => {
        if (!arenaSocketInstance) {
            arenaSocketInstance = io(`${SOCKET_URL}/arena`, {
                withCredentials: true,
                autoConnect: true
            });
            setSocket(arenaSocketInstance);
        }

        return () => {
            // Persistent instance
        };
    }, []);

    return socket;
};
