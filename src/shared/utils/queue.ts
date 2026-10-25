import { Queue } from 'bullmq';
import { redisConnection } from '../../config/redis';

// Define the central BullMQ Queue for Facebook messages
export const facebookMessageQueue = new Queue('facebook-messages', {
  connection: redisConnection,
});

facebookMessageQueue.on('error', () => {
  // Ignored or handled centrally to avoid unhandled EventEmitter dumps
});

