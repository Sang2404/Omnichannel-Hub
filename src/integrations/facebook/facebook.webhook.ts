import { Router, Request, Response, NextFunction } from 'express';
import { env } from '../../config/env';
import { facebookMessageQueue } from '../../shared/utils/queue';
import { logger } from '../../shared/utils/logger';

const router = Router();

/**
 * GET webhook endpoint for verification from Facebook.
 */
router.get('/', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === env.FACEBOOK_VERIFY_TOKEN) {
    logger.info('Facebook Webhook verified successfully.');
    res.status(200).send(challenge);
  } else {
    logger.warn('Facebook Webhook verification failed.');
    res.sendStatus(403);
  }
});

/**
 * POST webhook endpoint to receive incoming Facebook messages.
 */
router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const body = req.body;

  if (body.object !== 'page') {
    res.sendStatus(404);
    return;
  }

  try {
    // Facebook webhook events can contain batches of entries/messages
    for (const entry of body.entry) {
      if (!entry.messaging) continue;

      for (const event of entry.messaging) {
        // We only handle incoming text messages from customers
        if (event.message && event.message.text && !event.message.is_echo) {
          const payload = {
            senderId: event.sender.id,
            text: event.message.text,
            messageId: event.message.mid,
            timestamp: event.timestamp || Date.now(),
          };

          // Push to BullMQ queue for async processing
          await facebookMessageQueue.add('receive-fb-message', payload);
          logger.info(`Queued incoming Facebook message from ${payload.senderId}`);
        }
      }
    }

    res.status(200).send('EVENT_RECEIVED');
  } catch (error) {
    next(error);
  }
});

export default router;
