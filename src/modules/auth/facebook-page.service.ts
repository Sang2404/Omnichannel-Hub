import axios from 'axios';
import { prisma } from '../../config/database';
import { logger } from '../../shared/utils/logger';
import { ApiError } from '../../shared/utils/api-error';

export interface FacebookPageItem {
  id: string;
  name: string;
  access_token: string;
  category?: string;
}

export class FacebookPageService {
  /**
   * Fetches the list of Facebook Fanpages that the user manages via their User Access Token.
   * If a test/demo token is supplied, returns simulated fanpages for smooth demonstration.
   */
  async fetchAvailablePages(userAccessToken: string): Promise<FacebookPageItem[]> {
    if (!userAccessToken || userAccessToken.trim() === '') {
      throw ApiError.badRequest('User Access Token is required');
    }

    // Support Demo / Simulation Mode for Academic Presentations
    if (userAccessToken.startsWith('mock_') || userAccessToken === 'demo_token') {
      logger.info('Simulating Facebook Pages for Presentation Demo');
      return [
        {
          id: '109823471829301',
          name: 'OmniHub Official Store (Bình Dương)',
          access_token: 'EAA_MOCK_TOKEN_OFFICIAL_STORE_109823471829301',
          category: 'Retail Company',
        },
        {
          id: '204918273619283',
          name: 'Thời Trang Công Nghệ Số TDMU',
          access_token: 'EAA_MOCK_TOKEN_TDMU_FASHION_204918273619283',
          category: 'Apparel & Clothing',
        },
      ];
    }

    try {
      const response = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
        params: {
          access_token: userAccessToken,
          fields: 'id,name,access_token,category',
        },
      });

      const pages: FacebookPageItem[] = response.data?.data || [];
      return pages;
    } catch (error: any) {
      logger.error('Failed to fetch Facebook pages from Meta API:', error.response?.data || error.message);
      throw ApiError.badRequest(
        error.response?.data?.error?.message || 'Không thể lấy danh sách Fanpage từ Facebook. Vui lòng kiểm tra Token!'
      );
    }
  }

  /**
   * Links a selected Facebook Page to the current Shop Owner (Admin) in the database.
   */
  async selectAndConnectPage(
    userId: string,
    page: { id: string; name: string; accessToken: string }
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        fbPageId: page.id,
        fbPageName: page.name,
        fbPageAccessToken: page.accessToken,
        fbConnectedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        fbPageId: true,
        fbPageName: true,
        fbConnectedAt: true,
      },
    });

    logger.info(`Shop Admin ${user.email} successfully linked Facebook Page: ${page.name} (${page.id})`);
    return updatedUser;
  }

  /**
   * Retrieves the current Facebook Page connection status for the logged-in Shop Owner.
   */
  async getPageConnectionStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        fbPageId: true,
        fbPageName: true,
        fbConnectedAt: true,
      },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const isConnected = Boolean(user.fbPageId && user.fbPageName);

    return {
      isConnected,
      page: isConnected
        ? {
            id: user.fbPageId,
            name: user.fbPageName,
            connectedAt: user.fbConnectedAt,
            verified: true,
          }
        : null,
    };
  }

  /**
   * Disconnects the active Facebook Page from the Shop account.
   */
  async disconnectPage(userId: string) {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        fbPageId: null,
        fbPageName: null,
        fbPageAccessToken: null,
        fbConnectedAt: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    logger.info(`Shop Admin ${updatedUser.email} disconnected Facebook Page.`);
    return { success: true, message: 'Đã hủy kết nối Fanpage Facebook thành công.' };
  }
}
