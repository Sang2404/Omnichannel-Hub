import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocketClient = (): Socket => {
  if (!socket) {
    socket = io('/', {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });
  }
  return socket;
};
