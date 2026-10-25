import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { ApiError } from '../utils/api-error';
import { UserPayload } from '../types';

/**
 * Middleware that authenticates request using JWT authorization header.
 * Attaches the decoded user payload to req.user.
 */
export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Missing or malformed Authorization header'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as UserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return next(ApiError.unauthorized('Invalid or expired token'));
  }
}
