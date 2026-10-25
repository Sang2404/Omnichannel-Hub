import http from 'http';
import app from './app';
import { env } from './config/env';
import { prisma } from './config/database';
import { initSocketServer } from './config/socket';
import { logger } from './shared/utils/logger';

import { startWorkers } from './workers';

const server = http.createServer(app);

// Attach Socket.io to HTTP Server
initSocketServer(server);

/**
 * Boots the backend application.
 * Verifies Postgres database connection before starting the HTTP listener.
 */
async function bootstrap() {
  try {
    logger.info('Verifying database connection...');
    await prisma.$connect();
    logger.info('Database connection verified successfully.');

    // Start background queue workers
    startWorkers();

    server.listen(env.PORT, () => {
      logger.info(`🚀 Server running in [${env.NODE_ENV}] mode on port ${env.PORT}`);
    });
  } catch (error) {
    logger.error('❌ Database connection failure during bootstrap:', error);
    // If db connection fails in dev, we still spin up the server so developers can fix variables
    if (env.NODE_ENV === 'development') {
      logger.warn('⚠️ Development mode bypass database failure: Starting server anyway.');
      server.listen(env.PORT, () => {
        logger.info(`🚀 Server running (bypass DB error) on port ${env.PORT}`);
      });
    } else {
      process.exit(1);
    }
  }
}

// Handle shutdown events for database client cleanups
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  await prisma.$disconnect();
  server.close(() => {
    logger.info('Process terminated.');
  });
});

bootstrap();
