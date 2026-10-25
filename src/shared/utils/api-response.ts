import { Response } from 'express';

interface ApiResponseOptions<T> {
  res: Response;
  statusCode?: number;
  message?: string;
  data?: T;
}

/**
 * Standardized success response structure.
 */
export function successResponse<T>({
  res,
  statusCode = 200,
  message = 'Success',
  data,
}: ApiResponseOptions<T>): Response {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/**
 * Standardized error response structure.
 */
export function errorResponse({
  res,
  statusCode = 500,
  message = 'An unexpected error occurred',
  details = null,
}: {
  res: Response;
  statusCode?: number;
  message?: string;
  details?: any;
}): Response {
  return res.status(statusCode).json({
    success: false,
    message,
    details,
  });
}
