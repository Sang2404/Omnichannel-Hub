import { z } from 'zod';

export const sendMessageSchema = z.object({
  customerId: z.string().optional(),
  conversationId: z.string().optional(),
  content: z.string().min(1, 'Message content cannot be empty'),
  messageType: z.enum(['TEXT', 'IMAGE', 'QR_CODE']).optional().default('TEXT'),
});

export const queryConversationSchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
});
