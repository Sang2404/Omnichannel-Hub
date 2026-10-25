import { shopeeClient, generateShopeeSignature } from './shopee.client';
import { env } from '../../config/env';
import { logger } from '../../shared/utils/logger';

export class ShopeeService {
  private isMockMode(): boolean {
    return (
      env.SHOPEE_PARTNER_KEY.includes('placeholder') ||
      env.SHOPEE_PARTNER_ID === 123456
    );
  }

  /**
   * Updates product stock on the Shopee Open API platform.
   * If credentials are placeholders, simulates a successful integration update.
   * 
   * @param shopeeItemId - Product ID on Shopee platform
   * @param stock - Internal product stock quantity to synchronize
   */
  async updateStock(shopeeItemId: bigint, stock: number): Promise<boolean> {
    if (this.isMockMode()) {
      logger.info(`[MOCK SHOPEE] Synchronized stock for Shopee Item ${shopeeItemId.toString()} -> New stock: ${stock}`);
      return true;
    }

    try {
      const path = '/api/v2/product/update_stock';
      const timestamp = Math.floor(Date.now() / 1000);
      const sign = generateShopeeSignature(path, timestamp);

      const response = await shopeeClient.post(
        path,
        {
          item_id: shopeeItemId.toString(),
          stock_list: [
            {
              normal_stock: stock,
            },
          ],
        },
        {
          params: {
            partner_id: env.SHOPEE_PARTNER_ID,
            shop_id: env.SHOPEE_SHOP_ID,
            timestamp,
            sign,
          },
        }
      );

      if (response.data?.error === '') {
        logger.info(`Successfully synchronized stock to Shopee for Item: ${shopeeItemId.toString()}`);
        return true;
      }
      throw new Error(response.data?.message || 'Shopee API returned error');
    } catch (error: any) {
      logger.error(`Failed to synchronize stock to Shopee for Item ${shopeeItemId.toString()}:`, error.message);
      return false;
    }
  }
}
