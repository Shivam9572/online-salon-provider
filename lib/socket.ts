// lib/socket.ts
import { io, Socket } from 'socket.io-client';


let socket: Socket | null = null;

export function connectSocket(): Socket {
  if (!socket) {
    const token = document.cookie
      .split(';')
      .find(c => c.trim().startsWith('token='))
      ?.split('=')[1];
    socket = io(process.env.NEXT_PUBLIC_BACKEND_HOST, {
      withCredentials: true,
      transports: ['polling'],
      reconnection: true,        // ✅
      reconnectionAttempts: 5,   // ✅
      reconnectionDelay: 1000,
      path: '/socket.io',
      auth: { token }
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket(): Socket | null {
  return socket;
}