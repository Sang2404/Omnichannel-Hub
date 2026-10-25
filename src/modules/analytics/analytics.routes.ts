import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { analyticsQuerySchema, topProductsQuerySchema, forecastQuerySchema } from './analytics.validation';
import { validateRequest } from '../../shared/middlewares/validate.middleware';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { requireRoles } from '../../shared/middlewares/role.middleware';
import { Role } from '@prisma/client';

const router = Router();
const controller = new AnalyticsController();

// Only Shop Owner (ADMIN) users can access their shop's business intelligence stats
router.use(authMiddleware);
router.use(requireRoles(Role.ADMIN));

router.get('/kpi-overview', validateRequest(analyticsQuerySchema, 'query'), controller.getKpiOverview);
router.get('/revenue-trend', validateRequest(analyticsQuerySchema, 'query'), controller.getRevenueTrend);
router.get('/channel-performance', validateRequest(analyticsQuerySchema, 'query'), controller.getChannelPerformance);
router.get('/profit-breakdown', validateRequest(analyticsQuerySchema, 'query'), controller.getProfitBreakdown);
router.get('/top-products', validateRequest(topProductsQuerySchema, 'query'), controller.getTopProducts);
router.get('/inventory-alerts', controller.getInventoryAlerts);
router.get('/inventory-forecast', validateRequest(forecastQuerySchema, 'query'), controller.getInventoryForecast);
router.get('/chat-conversion', validateRequest(analyticsQuerySchema, 'query'), controller.getChatConversion);

export default router;
