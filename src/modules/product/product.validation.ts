import { z } from 'zod';

export const createProductSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be greater than 0'),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
  weight: z.number().int().positive('Weight must be greater than 0').default(500),
  shopeePrice: z.number().positive('Shopee price must be greater than 0').optional(),
  shopeeItemId: z.string().optional(), // Passed as string to handle BigInt precision in JS
});

export const updateProductSchema = createProductSchema.partial();
export const queryProductSchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  search: z.string().optional(),
});
