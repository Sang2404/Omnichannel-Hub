import { z } from 'zod';

export const analyticsQuerySchema = z.object({
  period: z.enum(['today', '7d', '30d', '90d', 'custom']).default('30d'),
  from: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
  to: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
});

export const topProductsQuerySchema = analyticsQuerySchema.extend({
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 5)),
  sortBy: z.enum(['quantity', 'revenue', 'profit']).default('quantity'),
});

export const forecastQuerySchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  forecastDays: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 30)).default('30'),
});
