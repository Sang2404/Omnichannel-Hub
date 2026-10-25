import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { successResponse } from '../../shared/utils/api-response';
import { ApiError } from '../../shared/utils/api-error';

const authService = new AuthService();

export class AuthController {
  /**
   * HTTP Controller endpoint to handle user registration.
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.register(req.body);
      successResponse({
        res,
        statusCode: 201,
        message: 'User registered successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * HTTP Controller endpoint to handle user login.
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);
      successResponse({
        res,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * HTTP Controller endpoint to retrieve the current user's profile.
   */
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }
      successResponse({
        res,
        message: 'Profile retrieved successfully',
        data: req.user,
      });
    } catch (error) {
      next(error);
    }
  }

  async listUsers(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await authService.listUsers();
      successResponse({
        res,
        message: 'Users retrieved successfully',
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role, shopName } = req.body;
      const updated = await authService.updateUserRole(req.params.id, role, shopName);
      successResponse({
        res,
        message: 'User updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSystemOverview(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const overview = await authService.getSystemOverview();
      successResponse({
        res,
        message: 'System overview retrieved successfully',
        data: overview,
      });
    } catch (error) {
      next(error);
    }
  }
}

