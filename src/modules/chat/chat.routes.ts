import { Router } from 'express';
import { ChatController } from './chat.controller';
import { sendMessageSchema, queryConversationSchema } from './chat.validation';
import { validateRequest } from '../../shared/middlewares/validate.middleware';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';

const router = Router();
const controller = new ChatController();

// Auth required for all chat routes
router.use(authMiddleware);

router.get('/conversations', validateRequest(queryConversationSchema, 'query'), controller.listConversations);
router.get('/conversations/:conversationId/messages', controller.getMessages);
router.post('/messages', validateRequest(sendMessageSchema, 'body'), controller.send);
router.post('/ai-parse', controller.aiParseOrder);

export default router;
