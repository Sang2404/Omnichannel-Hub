import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { logger } from '../shared/utils/logger';

let io: Server | null = null;

/**
 * Initializes the Socket.io server with CORS and connection lifecycle listeners.
 * 
 * @param httpServer - The HTTP Server instance to attach socket.io to
 * @returns The initialized Socket.io Server instance
 */
export function initSocketServer(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: '*', // Adjust origins in production
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`Socket client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      logger.info(`Socket client disconnected: ${socket.id}`);
    });
  });

  return io;
}

/**
 * Retrieves the global Socket.io Server instance.
 * Throws an error if the server has not been initialized.
 * 
 * @returns The global Socket.io Server instance
 */
export function getSocketServer(): Server {
  if (!io) {
    throw new Error('Socket.io server has not been initialized!');
  }
  return io;
}
