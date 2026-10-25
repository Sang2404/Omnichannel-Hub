import { fbClient } from './facebook.client';
import { logger } from '../../shared/utils/logger';

export class FacebookService {
  /**
   * Retrieves profile details (name) of a Facebook user (PSID).
   * Used during customer auto-registration.
   * 
   * @param psid - Page Scoped User ID
   * @returns User's full name or placeholder
   */
  async getUserProfile(psid: string): Promise<{ name: string }> {
    try {
      const response = await fbClient.get(`/${psid}`, {
        params: { fields: 'first_name,last_name' },
      });

      const { first_name, last_name } = response.data;
      const name = `${first_name} ${last_name}`.trim();
      return { name: name || 'Facebook User' };
    } catch (error) {
      logger.error(`Failed to fetch Facebook profile for user ${psid}:`, error);
      return { name: 'Khách hàng Facebook' }; // Fallback name
    }
  }

  /**
   * Sends a plain text message to a Facebook Messenger recipient.
   * 
   * @param recipientId - Page Scoped User ID
   * @param text - Text message content
   */
  async sendTextMessage(recipientId: string, text: string): Promise<any> {
    try {
      const response = await fbClient.post('/me/messages', {
        recipient: { id: recipientId },
        message: { text },
      });
      return response.data;
    } catch (error: any) {
      logger.error(`Error sending text message to ${recipientId}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Sends an image attachment message (e.g., VietQR code image URL) to a recipient.
   * 
   * @param recipientId - Page Scoped User ID
   * @param imageUrl - Fully qualified absolute URL of the image
   */
  async sendImageMessage(recipientId: string, imageUrl: string): Promise<any> {
    try {
      const response = await fbClient.post('/me/messages', {
        recipient: { id: recipientId },
        message: {
          attachment: {
            type: 'image',
            payload: {
              url: imageUrl,
              is_reusable: true,
            },
          },
        },
      });
      return response.data;
    } catch (error: any) {
      logger.error(`Error sending image message to ${recipientId}:`, error.response?.data || error.message);
      throw error;
    }
  }
}
