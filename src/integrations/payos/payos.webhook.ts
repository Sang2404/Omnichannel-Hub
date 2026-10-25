import { Router, Request, Response, NextFunction } from 'express';
import { PayosService } from './payos.service';
import { OrderService } from '../../modules/order/order.service';
import { logger } from '../../shared/utils/logger';

const router = Router();
const payosService = new PayosService();
const orderService = new OrderService();

/**
 * POST /webhooks/payos
 * PayOS payment callback webhook endpoint.
 * Bypasses standard JWT authentication, but verifies webhook payload signature.
 */
router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const body = req.body;
    logger.info(`Received PayOS payment webhook notification:`, { orderCode: body.data?.orderCode });

    // 1. Verify webhook signature and retrieve decrypted payload
    const verifiedData = await payosService.verifyWebhookData(body);

    // 2. Process order updates if transaction succeeded
    // PayOS triggers success when response Code is "00"
    if (body.success || body.code === '00' || verifiedData) {
      const orderCode = verifiedData.orderCode;
      const paymentId = verifiedData.paymentLinkId;

      logger.info(`PayOS payment validated. Upgrading Order #${orderCode} to PAID.`);
      
      // Execute payment confirmation workflow (DB updates, stock decrements, GHN dispatch, etc.)
      await orderService.handlePaymentSuccess(orderCode, paymentId);
    }

    res.status(200).json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    logger.error('Error processing PayOS webhook:', error);
    next(error);
  }
});

export default router;
