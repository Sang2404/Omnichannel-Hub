import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../shared/utils/logger';

let hasLoggedRedisError = false;

const redisConfig = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  tls: env.REDIS_HOST.includes('upstash.io') ? { rejectUnauthorized: false } : undefined,
  maxRetriesPerRequest: null, // Required by BullMQ
  retryStrategy(times: number) {
    if (times > 2) {
      return null; // Stop retrying after 2 attempts to prevent console flooding
    }
    return 2000;
  },
  enableOfflineQueue: false,
};

// Create a connection instance for general caching/pub-sub
export const redisConnection = new Redis(redisConfig);

redisConnection.on('connect', () => {
  logger.info('Connected to Redis server');
});

redisConnection.on('error', (_err) => {
  if (!hasLoggedRedisError) {
    logger.warn('Redis server is currently offline or unreachable. Background workers will operate in fallback mode.');
    hasLoggedRedisError = true;
  }
});
