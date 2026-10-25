import { ghnClient } from './ghn.client';
import { env } from '../../config/env';
import { logger } from '../../shared/utils/logger';

export class GhnService {
  private readonly defaultFromDistrict = 1544; // Thủ Dầu Một, Bình Dương
  private readonly defaultFromWard = '290913';

  /**
   * Calculates the shipping fee using GHN API.
   * If the API fails (e.g. invalid token/sandbox offline), returns a fallback mock fee.
   * 
   * @param toDistrictId - Destination district ID
   * @param toWardCode - Destination ward code
   * @param weight - Package weight in grams
   */
  async calculateShippingFee(toDistrictId: number, toWardCode: string, weight: number): Promise<number> {
    try {
      const response = await ghnClient.post('/shiip/public-api/v2/shipping-order/fee', {
        from_district_id: this.defaultFromDistrict,
        from_ward_code: this.defaultFromWard,
        to_district_id: toDistrictId,
        to_ward_code: toWardCode,
        weight: weight,
        service_type_id: 2, // Standard shipping service
      });

      if (response.data?.code === 200) {
        return response.data.data.total;
      }
      throw new Error(response.data?.message || 'Failed to calculate GHN fee');
    } catch (error: any) {
      logger.warn(`GHN API fee calculation failed, using fallback mock fee. Details: ${error.message}`);
      // Fallback calculation: 25k base + 5k per 500g above 1kg
      const baseFee = 25000;
      const extraWeight = Math.max(0, weight - 1000);
      const extraFee = Math.ceil(extraWeight / 500) * 5000;
      return baseFee + extraFee;
    }
  }

  /**
   * Submits a shipping order creation request to GHN Sandbox.
   * Returns a generated tracking code.
   * 
   * @param orderData - Shipping details (customer info, package weight, and items)
   */
  async createShippingOrder(orderData: {
    toName: string;
    toPhone: string;
    toAddress: string;
    toDistrictId: number;
    toWardCode: string;
    weight: number;
    items: Array<{ name: string; sku: string; quantity: number }>;
  }): Promise<string> {
    try {
      const response = await ghnClient.post(
        '/shiip/public-api/v2/shipping-order/create',
        {
          payment_type_id: 1, // Shop pays shipping fee (pre-paid by client)
          note: 'Giao hàng đa kênh Omnichannel Hub',
          required_note: 'CHOXEMHANGKHONGTHU',
          to_name: orderData.toName,
          to_phone: orderData.toPhone,
          to_address: orderData.toAddress,
          to_ward_code: orderData.toWardCode,
          to_district_id: orderData.toDistrictId,
          weight: orderData.weight,
          length: 15,
          width: 15,
          height: 15,
          service_type_id: 2,
          cod_amount: 0, // Already prepaid via PayOS
          items: orderData.items.map((item) => ({
            name: item.name,
            code: item.sku,
            quantity: item.quantity,
          })),
        },
        {
          headers: {
            ShopId: env.GHN_SHOP_ID,
          },
        }
      );

      if (response.data?.code === 200) {
        return response.data.data.order_code;
      }
      throw new Error(response.data?.message || 'Failed to create GHN order');
    } catch (error: any) {
      logger.warn(`GHN API order creation failed, using generated mock tracking code. Details: ${error.message}`);
      // Fallback: Generate a simulated tracking code
      const randNum = Math.floor(10000000 + Math.random() * 90000000);
      return `GHN_MOCK_${randNum}`;
    }
  }
}
