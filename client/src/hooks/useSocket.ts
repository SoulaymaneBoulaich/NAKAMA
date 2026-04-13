import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let socketInstance: Socket | null = null;

export const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(socketInstance);

    useEffect(() => {
        if (!socketInstance) {
            socketInstance = io(SOCKET_URL, {
                withCredentials: true,
                autoConnect: true
            });
            setSocket(socketInstance);
        }

        return () => {
            // We usually want to keep the socket alive across page navigations in a SPA
            // but we can handle specific cleanups in components
        };
    }, []);

    return socket;
};
