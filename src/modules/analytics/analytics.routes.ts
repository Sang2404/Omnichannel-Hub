import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { analyticsQuerySchema, topProductsQuerySchema, forecastQuerySchema } from './analytics.validation';
import { validateRequest } from '../../shared/middlewares/validate.middleware';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { requireRoles } from '../../shared/middlewares/role.middleware';
import { Role } from '@prisma/client';

const router = Router();
const controller = new AnalyticsController();

// Auth required for all analytics routes
router.use(authMiddleware);

// Operational Dashboard metrics - Available to both Shop Owner (ADMIN) and Staff (STAFF)
router.get('/kpi-overview', validateRequest(analyticsQuerySchema, 'query'), controller.getKpiOverview);
router.get('/revenue-trend', validateRequest(analyticsQuerySchema, 'query'), controller.getRevenueTrend);
router.get('/chat-conversion', validateRequest(analyticsQuerySchema, 'query'), controller.getChatConversion);
router.get('/inventory-alerts', controller.getInventoryAlerts);

// Financial Profit & Deep Business Intelligence - Shop Owner (ADMIN) only
router.get('/channel-performance', requireRoles(Role.ADMIN), validateRequest(analyticsQuerySchema, 'query'), controller.getChannelPerformance);
router.get('/profit-breakdown', requireRoles(Role.ADMIN), validateRequest(analyticsQuerySchema, 'query'), controller.getProfitBreakdown);
router.get('/top-products', requireRoles(Role.ADMIN), validateRequest(topProductsQuerySchema, 'query'), controller.getTopProducts);
router.get('/inventory-forecast', requireRoles(Role.ADMIN), validateRequest(forecastQuerySchema, 'query'), controller.getInventoryForecast);

export default router;
