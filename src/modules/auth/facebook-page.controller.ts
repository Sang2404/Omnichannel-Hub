import { Request, Response, NextFunction } from 'express';
import { FacebookPageService } from './facebook-page.service';
import { successResponse } from '../../shared/utils/api-response';

const facebookPageService = new FacebookPageService();

export class FacebookPageController {
  /**
   * Endpoint to retrieve available fanpages using a user access token
   * POST /api/auth/facebook/pages
   */
  async getAvailablePages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userAccessToken } = req.body;
      const pages = await facebookPageService.fetchAvailablePages(userAccessToken);
      successResponse({
        res,
        message: 'Lấy danh sách Fanpage Facebook thành công',
        data: pages,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Endpoint to link a selected fanpage to the admin user
   * POST /api/auth/facebook/connect
   */
  async connectPage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id || (req as any).user?.userId;
      const { id, name, accessToken } = req.body;

      const updatedUser = await facebookPageService.selectAndConnectPage(userId, {
        id,
        name,
        accessToken,
      });

      successResponse({
        res,
        message: `Đã kết nối thành công với Fanpage ${name}`,
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Endpoint to check connection status of the shop's Fanpage
   * GET /api/auth/facebook/status
   */
  async getConnectionStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id || (req as any).user?.userId;
      const status = await facebookPageService.getPageConnectionStatus(userId);
      successResponse({
        res,
        message: 'Lấy trạng thái kết nối Fanpage thành công',
        data: status,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Endpoint to disconnect fanpage
   * POST /api/auth/facebook/disconnect
   */
  async disconnectPage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id || (req as any).user?.userId;
      const result = await facebookPageService.disconnectPage(userId);
      successResponse({
        res,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
