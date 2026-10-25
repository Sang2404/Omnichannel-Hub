import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiError } from '../utils/api-error';

/**
 * Express middleware builder to validate incoming request data using Zod schema.
 * Validates req.body, req.query, or req.params.
 *
 * @param schema - Zod Schema definition
 * @param source - Source field in Request ('body' | 'query' | 'params')
 */
export function validateRequest(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req[source]);
      req[source] = validatedData; // Re-assign validated and casted data
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Flatten and map validation issues into readable formats
        const issues = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        next(ApiError.badRequest('Validation error', issues));
      } else {
        next(error);
      }
    }
  };
}
