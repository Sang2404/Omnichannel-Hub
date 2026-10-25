/**
 * Custom application-wide API Error class that extends JavaScript's built-in Error.
 * Allows passing an HTTP status code alongside the error message.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly details: any;

  constructor(statusCode: number, message: string, details: any = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details: any = null) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message: string = 'Unauthorized') {
    return new ApiError(401, message);
  }

  static forbidden(message: string = 'Forbidden') {
    return new ApiError(403, message);
  }

  static notFound(message: string = 'Resource not found') {
    return new ApiError(404, message);
  }

  static internal(message: string = 'Internal server error') {
    return new ApiError(500, message);
  }
}
