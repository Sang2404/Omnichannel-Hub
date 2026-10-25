import { initFacebookMessageWorker } from './facebook-message.worker';
import { logger } from '../shared/utils/logger';

/**
 * Bootstraps and starts all BullMQ background queue workers.
 */
export function startWorkers() {
  logger.info('Starting background queue workers...');
  initFacebookMessageWorker();
  logger.info('Workers started successfully.');
}
