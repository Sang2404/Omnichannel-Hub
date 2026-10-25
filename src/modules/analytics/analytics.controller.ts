import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from './analytics.service';
import { successResponse } from '../../shared/utils/api-response';

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  async getKpiOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { period, from, to } = req.query as any;
      const data = await analyticsService.getKpiOverview(period, from, to);
      successResponse({ res, message: 'KPI overview retrieved successfully', data });
    } catch (error) {
      next(error);
    }
  }

  async getRevenueTrend(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { period, from, to } = req.query as any;
      const data = await analyticsService.getRevenueTrend(period, from, to);
      successResponse({ res, message: 'Revenue trend retrieved successfully', data });
    } catch (error) {
      next(error);
    }
  }

  async getChannelPerformance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { period, from, to } = req.query as any;
      const data = await analyticsService.getChannelPerformance(period, from, to);
      successResponse({ res, message: 'Channel performance retrieved successfully', data });
    } catch (error) {
      next(error);
    }
  }

  async getProfitBreakdown(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { period, from, to } = req.query as any;
      const data = await analyticsService.getProfitBreakdown(period, from, to);
      successResponse({ res, message: 'Profit breakdown retrieved successfully', data });
    } catch (error) {
      next(error);
    }
  }

  async getTopProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { period, from, to, limit, sortBy } = req.query as any;
      const data = await analyticsService.getTopProducts(period, from, to, limit, sortBy);
      successResponse({ res, message: 'Top products retrieved successfully', data });
    } catch (error) {
      next(error);
    }
  }

  async getInventoryAlerts(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getInventoryAlerts();
      successResponse({ res, message: 'Inventory alerts retrieved successfully', data });
    } catch (error) {
      next(error);
    }
  }

  async getInventoryForecast(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { productId, forecastDays } = req.query as any;
      const data = await analyticsService.getInventoryForecast(productId, forecastDays);
      successResponse({ res, message: 'Inventory forecast retrieved successfully', data });
    } catch (error) {
      next(error);
    }
  }

  async getChatConversion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { period, from, to } = req.query as any;
      const data = await analyticsService.getChatConversion(period, from, to);
      successResponse({ res, message: 'Chat conversion funnel retrieved successfully', data });
    } catch (error) {
      next(error);
    }
  }
}
