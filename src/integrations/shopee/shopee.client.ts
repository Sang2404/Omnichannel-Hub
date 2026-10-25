import axios from 'axios';
import crypto from 'crypto';
import { env } from '../../config/env';
import { logger } from '../../shared/utils/logger';

// Create pre-configured Axios instance for Shopee API Sandbox
export const shopeeClient = axios.create({
  baseURL: env.SHOPEE_API_URL,
});

shopeeClient.interceptors.response.use(
  (response) => response,
  (error) => {
    logger.error('Shopee Open API request failure:', {
      status: error.response?.status,
      data: error.response?.data || error.message,
    });
    return Promise.reject(error);
  }
);

/**
 * Helper to compute Shopee Open API v2 HMAC signature.
 * 
 * @param path - API Endpoint path (e.g. /api/v2/product/update_stock)
 * @param timestamp - Current UNIX timestamp (in seconds)
 * @returns HEX encoded signature
 */
export function generateShopeeSignature(path: string, timestamp: number): string {
  const signString = `${env.SHOPEE_PARTNER_ID}${path}${timestamp}${env.SHOPEE_SHOP_ID}`;
  return crypto
    .createHmac('sha256', env.SHOPEE_PARTNER_KEY)
    .update(signString)
    .digest('hex');
}
