import { Request, Response, NextFunction } from 'express';
import { ChatService } from './chat.service';
import { AiOrderParserService } from './ai-parser.service';
import { successResponse } from '../../shared/utils/api-response';

const chatService = new ChatService();
const aiOrderParser = new AiOrderParserService();

export class ChatController {
  async listConversations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await chatService.listConversations(req.query as any);
      successResponse({
        res,
        message: 'Conversations retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const messages = await chatService.getMessages(req.params.conversationId);
      successResponse({
        res,
        message: 'Messages retrieved successfully',
        data: messages,
      });
    } catch (error) {
      next(error);
    }
  }

  async send(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const message = await chatService.sendStaffMessage(req.body);
      successResponse({
        res,
        statusCode: 201,
        message: 'Message sent successfully',
        data: message,
      });
    } catch (error) {
      next(error);
    }
  }

  async aiParseOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { text, conversationId } = req.body;
      let result;
      if (conversationId) {
        result = await aiOrderParser.parseFromConversation(conversationId);
      } else {
        result = await aiOrderParser.parseMessage(text || '');
      }
      successResponse({
        res,
        message: 'AI Order Parsing completed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
