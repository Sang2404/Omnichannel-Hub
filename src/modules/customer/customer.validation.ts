import { z } from 'zod';

export const createCustomerSchema = z.object({
  fbUserId: z.string().optional().nullable(),
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  districtId: z.number().int().optional().nullable(),
  wardCode: z.string().optional().nullable(),
  customTag: z.string().optional().nullable(),
});

export const updateCustomerSchema = createCustomerSchema.partial();
export const queryCustomerSchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  search: z.string().optional(),
});
