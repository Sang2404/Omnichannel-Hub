import { Request, Response, NextFunction } from 'express';
import { NotificationService } from './notification.service';
import { successResponse } from '../../shared/utils/api-response';

const notificationService = new NotificationService();

export class NotificationController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 25;
      const data = await notificationService.listNotifications(limit);
      successResponse({
        res,
        message: 'Notifications fetched successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updated = await notificationService.markAsRead(id);
      successResponse({
        res,
        message: 'Notification marked as read',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await notificationService.markAllAsRead();
      successResponse({
        res,
        message: 'All notifications marked as read',
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notification = await notificationService.createNotification(req.body);
      successResponse({
        res,
        statusCode: 201,
        message: 'Notification created successfully',
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  }
}
