import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import productRoutes from '../modules/product/product.routes';
import customerRoutes from '../modules/customer/customer.routes';
import chatRoutes from '../modules/chat/chat.routes';
import orderRoutes from '../modules/order/order.routes';
import analyticsRoutes from '../modules/analytics/analytics.routes';
import notificationRoutes from '../modules/notification/notification.routes';

// Webhooks
import facebookWebhook from '../integrations/facebook/facebook.webhook';
import payosWebhook from '../integrations/payos/payos.webhook';
import shopeeWebhook from '../integrations/shopee/shopee.webhook';

const router = Router();

// API Modules
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/customers', customerRoutes);
router.use('/chat', chatRoutes);
router.use('/orders', orderRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/notifications', notificationRoutes);

// Webhook Receivers
router.use('/webhooks/facebook', facebookWebhook);
router.use('/webhooks/payos', payosWebhook);
router.use('/webhooks/shopee', shopeeWebhook);

// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

export default router;
