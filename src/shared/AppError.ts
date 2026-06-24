import { HTTP_STATUS, HttpStatus } from '../constants/httpCodes';

export class AppError extends Error {
  public readonly statusCode: HttpStatus;
  public readonly isOperational: boolean;
  public readonly errors?: { field: string; message: string }[];

  constructor(
    message: string,
    statusCode: HttpStatus = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errors?: { field: string; message: string }[],
    isOperational = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static notFound(resource = 'Resource'): AppError {
    return new AppError(`${resource} not found`, HTTP_STATUS.NOT_FOUND);
  }

  static unauthorized(message = 'Authentication required'): AppError {
    return new AppError(message, HTTP_STATUS.UNAUTHORIZED);
  }

  static forbidden(message = 'Access denied'): AppError {
    return new AppError(message, HTTP_STATUS.FORBIDDEN);
  }

  static badRequest(message: string, errors?: { field: string; message: string }[]): AppError {
    return new AppError(message, HTTP_STATUS.BAD_REQUEST, errors);
  }

  static conflict(message: string): AppError {
    return new AppError(message, HTTP_STATUS.CONFLICT);
  }
}
