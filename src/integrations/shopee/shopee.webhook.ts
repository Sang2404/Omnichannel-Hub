import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database';
import { getSocketServer } from '../../config/socket';
import { logger } from '../../shared/utils/logger';

const router = Router();

/**
 * POST /webhooks/shopee
 * Shopee Open API Webhook endpoint.
 * Listens for platform events like ORDER_STATUS_TOGGLE.
 */
router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const payload = req.body;
    logger.info(`Received Shopee Webhook. Event Code: ${payload.code}`);

    // Check if the event type corresponds to a new order placement or status change
    if (payload.code === 1 || payload.event_type === 'ORDER_STATUS_TOGGLE') {
      const data = payload.data;
      const shopeeOrderId = data?.ordersn || data?.shopee_order_id;
      const items = data?.items || []; // Array of { item_id, quantity }

      logger.info(`Shopee Order placed/updated: ${shopeeOrderId}. Items count: ${items.length}`);

      // Transactionally deduct local stock for mapped products
      await prisma.$transaction(async (tx) => {
        for (const item of items) {
          const shopeeItemId = BigInt(item.item_id || item.shopee_item_id);
          const quantity = parseInt(item.quantity || 1, 10);

          // Find the internal product using mapping
          const mapping = await tx.shopeeProductMapping.findUnique({
            where: { shopeeItemId },
            include: { product: true },
          });

          if (mapping) {
            // Update local stock
            const updatedProduct = await tx.product.update({
              where: { id: mapping.productId },
              data: {
                stock: {
                  decrement: quantity,
                },
              },
            });

            logger.info(
              `Deducted local stock for product SKU: ${mapping.product.sku} (Shopee Item: ${shopeeItemId.toString()}) by quantity: ${quantity}. New stock: ${updatedProduct.stock}`
            );

            // Broadcast real-time stock and alerts via Socket.io
            try {
              const io = getSocketServer();
              io.emit('stock:synced', {
                productId: mapping.productId,
                shopeeItemId: shopeeItemId.toString(),
                newStock: updatedProduct.stock,
              });

              if (updatedProduct.stock <= 5) {
                io.emit('inventory:alert', {
                  id: updatedProduct.id,
                  sku: updatedProduct.sku,
                  name: updatedProduct.name,
                  currentStock: updatedProduct.stock,
                  status: 'critical',
                });
              }
            } catch (socketErr) {
              // Non-blocking socket error bypass
            }
          } else {
            logger.warn(`No local product mapping found for Shopee Item ID: ${shopeeItemId.toString()}`);
          }
        }
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Error processing Shopee webhook:', error);
    next(error);
  }
});

export default router;
