import { payOS } from './payos.client';
import { env } from '../../config/env';
import { logger } from '../../shared/utils/logger';

export class PayosService {
  private isMockMode(): boolean {
    return (
      env.PAYOS_CLIENT_ID.includes('placeholder') ||
      env.PAYOS_API_KEY.includes('placeholder')
    );
  }

  /**
   * Creates a payment checkout URL & VietQR code payload.
   * If credentials are placeholders, generates a simulated checkout response.
   * 
   * @param orderCode - Int unique code identifying the order (must match PostgreSQL orderCode)
   * @param amount - Amount to be paid in VND
   * @param description - Transfer message (e.g., TDMU12345)
   * @param returnUrl - Frontend redirect page upon success
   * @param cancelUrl - Frontend redirect page upon cancellation
   */
  async createPaymentLink(
    orderCode: number,
    amount: number,
    description: string,
    returnUrl: string,
    cancelUrl: string
  ) {
    if (this.isMockMode()) {
      logger.warn(`PayOS credentials are mock, generating simulated checkout link for orderCode: ${orderCode}`);
      
      // Return simulated checkout response
      const mockCheckoutId = `MOCK_PAYOS_TX_${Date.now()}`;
      return {
        bin: '970415',
        accountNumber: '11330099',
        accountName: 'CONG TY GIAI PHAP SO BINH DUONG',
        amount,
        description,
        orderCode,
        paymentLinkId: mockCheckoutId,
        status: 'PENDING',
        checkoutUrl: `https://pay.payos.vn/web/${mockCheckoutId}`,
        qrCode: `00020101021238540010A000000727012400069704150110113300990208QRPAY01053037045406${amount}5802VN5925BINHDUONG62170813${description}`,
      };
    }

    try {
      const paymentData = {
        orderCode: orderCode,
        amount: amount,
        description: description.substring(0, 25), // PayOS limit is 25 chars
        cancelUrl: cancelUrl,
        returnUrl: returnUrl,
      };

      const response = await payOS.createPaymentLink(paymentData);
      return response;
    } catch (error: any) {
      logger.error('Failed to create payment link with PayOS API:', error);
      throw error;
    }
  }

  /**
   * Verifies the integrity of PayOS webhook data using the SDK checksum signature.
   * 
   * @param body - Raw request body from PayOS webhook
   * @returns Verified webhook data object
   */
  async verifyWebhookData(body: any) {
    if (this.isMockMode()) {
      logger.info('Bypassing webhook signature verification due to mock credentials');
      return body.data;
    }

    try {
      const verified = payOS.verifyPaymentWebhookData(body);
      return verified;
    } catch (error: any) {
      logger.error('Webhook checksum verification failure:', error);
      throw error;
    }
  }
}
