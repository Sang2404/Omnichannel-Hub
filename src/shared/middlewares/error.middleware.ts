import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error';
import { errorResponse } from '../utils/api-response';
import { logger } from '../utils/logger';

/**
 * Global Express error handling middleware.
 * Intercepts all errors thrown in routes, logs them, and formats a standardized JSON response.
 */
export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error(`${req.method} ${req.path} - Error: ${err.message}`, { stack: err.stack });

  if (err instanceof ApiError) {
    errorResponse({
      res,
      statusCode: err.statusCode,
      message: err.message,
      details: err.details,
    });
    return;
  }

  // Handle Prisma validation or other database errors if needed
  if (err.name === 'PrismaClientKnownRequestError') {
    errorResponse({
      res,
      statusCode: 400,
      message: 'Database query validation failed',
      details: err.message,
    });
    return;
  }

  // Default server error fallback
  errorResponse({
    res,
    statusCode: 500,
    message: 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
}
