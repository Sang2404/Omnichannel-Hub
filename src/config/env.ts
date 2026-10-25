import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

const envSchema = z.object({
  PORT: z.string().transform((val) => parseInt(val, 10)).default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  JWT_SECRET: z.string().min(8, 'JWT_SECRET must be at least 8 characters long'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  DIRECT_URL: z.string().optional(),
  REDIS_HOST: z.string().default('127.0.0.1'),
  REDIS_PORT: z.string().transform((val) => parseInt(val, 10)).default('6379'),
  REDIS_PASSWORD: z.string().optional().default(''),
  FACEBOOK_PAGE_ACCESS_TOKEN: z.string().default(''),
  FACEBOOK_VERIFY_TOKEN: z.string().default(''),
  FACEBOOK_APP_SECRET: z.string().default(''),
  PAYOS_CLIENT_ID: z.string().default(''),
  PAYOS_API_KEY: z.string().default(''),
  PAYOS_CHECKSUM_KEY: z.string().default(''),
  GHN_API_TOKEN: z.string().default(''),
  GHN_SHOP_ID: z.string().transform((val) => parseInt(val, 10)).default('0'),
  GHN_API_URL: z.string().url().default('https://dev-online-gateway.ghn.vn'),
  SHOPEE_PARTNER_ID: z.string().transform((val) => parseInt(val, 10)).default('0'),
  SHOPEE_PARTNER_KEY: z.string().default(''),
  SHOPEE_SHOP_ID: z.string().transform((val) => parseInt(val, 10)).default('0'),
  SHOPEE_API_URL: z.string().url().default('https://partner.shopeesz.com'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:');
  console.error(JSON.stringify(_env.error.format(), null, 2));
  process.exit(1);
}

export const env = _env.data;
