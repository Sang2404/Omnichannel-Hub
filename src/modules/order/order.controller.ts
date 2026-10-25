import { Request, Response, NextFunction } from 'express';
import { OrderService } from './order.service';
import { successResponse } from '../../shared/utils/api-response';

const orderService = new OrderService();

export class OrderController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await orderService.placeOrder(req.body);
      successResponse({
        res,
        statusCode: 201,
        message: 'Order created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await orderService.listOrders(req.query as any);
      successResponse({
        res,
        message: 'Orders retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await orderService.getOrderById(req.params.id);
      successResponse({
        res,
        message: 'Order retrieved successfully',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await orderService.updateStatus(req.params.id, req.body.status);
      successResponse({
        res,
        message: 'Order status updated successfully',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }
}

