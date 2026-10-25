import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import { prisma } from '../config/database';
import { getSocketServer } from '../config/socket';
import { FacebookService } from '../integrations/facebook/facebook.service';
import { CustomerService } from '../modules/customer/customer.service';
import { logger } from '../shared/utils/logger';

const fbService = new FacebookService();
const customerService = new CustomerService();

export function initFacebookMessageWorker() {
  const worker = new Worker(
    'facebook-messages',
    async (job: Job) => {
      const { senderId, text, messageId, timestamp } = job.data;
      logger.info(`Processing FB message job ${job.id} from sender: ${senderId}`);

      try {
        // 1. Fetch user profile from FB API
        const profile = await fbService.getUserProfile(senderId);

        // 2. Get or create Customer
        const customer = await customerService.getOrCreateCustomerByFb(senderId, profile.name);

        // 3. Find or create Conversation
        let conversation = await prisma.conversation.findFirst({
          where: { customerId: customer.id },
        });

        if (!conversation) {
          conversation = await prisma.conversation.create({
            data: { customerId: customer.id },
          });
        }

        // 4. Save incoming message to Database
        const message = await prisma.message.create({
          data: {
            conversationId: conversation.id,
            senderType: 'CUSTOMER',
            content: text,
            messageType: 'TEXT',
            fbMessageId: messageId,
            createdAt: new Date(timestamp),
          },
        });

        // 5. Update Conversation metadata
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: {
            lastMessage: text,
            lastActiveAt: new Date(timestamp),
          },
        });

        // Create persistent system notification
        try {
          await prisma.notification.create({
            data: {
              title: `Tin nhắn Messenger mới`,
              message: `${customer.name}: "${text.slice(0, 80)}"`,
              category: 'chat',
              link: '/chat',
              isRead: false,
            },
          });
        } catch (notifErr) {
          logger.warn('Failed to save message notification:', notifErr);
        }

        // 6. Broadcast via Socket.io
        try {
          const io = getSocketServer();
          io.emit('chat:new-message', {
            customerId: customer.id,
            customerName: customer.name,
            conversationId: conversation.id,
            message,
          });
          logger.info(`Broadcasted new message via Socket.io to clients`);
        } catch (socketErr) {
          logger.warn(`Failed to broadcast via Socket.io (server might not be bound yet): ${socketErr}`);
        }
      } catch (error) {
        logger.error(`Failed to process message job ${job.id}:`, error);
        throw error;
      }
    },
    { connection: redisConnection }
  );

  worker.on('completed', (job) => {
    logger.info(`FB message job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`FB message job ${job?.id} failed with error:`, err);
  });

  worker.on('error', () => {
    // Handled to suppress unhandled connection error stack dumps when Redis is offline
  });

  return worker;
}
