import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { ApiError } from '../utils/api-error';

/**
 * Middleware builder that checks if the authenticated user has one of the allowed roles.
 * Must be used after authMiddleware.
 * 
 * @param allowedRoles - List of authorized roles allowed to access the endpoint
 */
export function requireRoles(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      return next(ApiError.unauthorized('User not authenticated'));
    }

    if (user.role !== Role.SUPER_ADMIN && !allowedRoles.includes(user.role)) {
      return next(ApiError.forbidden('You do not have permission to access this resource'));
    }

    next();
  };
}
