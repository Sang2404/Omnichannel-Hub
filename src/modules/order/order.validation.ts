import { z } from 'zod';
import { OrderChannel } from '@prisma/client';

export const createOrderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be greater than 0'),
});

export const createOrderSchema = z.object({
  channel: z.nativeEnum(OrderChannel).optional().default(OrderChannel.FACEBOOK),
  customerId: z.string().min(1, 'Customer ID is required'),
  items: z.array(createOrderItemSchema).min(1, 'Order must contain at least 1 item'),
  shippingFee: z.number().nonnegative().optional(),
  returnUrl: z.string().url().optional().default('http://localhost:3000/payment-success'),
  cancelUrl: z.string().url().optional().default('http://localhost:3000/payment-cancel'),
});

export const queryOrderSchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  status: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING_PAYMENT', 'PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED']),
});
