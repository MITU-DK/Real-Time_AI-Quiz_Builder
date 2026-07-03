//Socket.IO Client Service 
// Creates a singleton Socket.IO client connected to the /game namespace.

import { io, Socket } from 'socket.io-client';

const rawUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
const SOCKET_URL = rawUrl.endsWith('/game') ? rawUrl : `${rawUrl}/game`;

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, { autoConnect: false, transports: ['websocket'], });
    // we connect manually after the user joins
    // skip HTTP long-polling, go straight to WS
  }
  return socket;
};

export const connectSocket = (): Socket => {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
};

export const disconnectSocket = (): void => {
  if (socket?.connected) {
    socket.disconnect();
  }
};
