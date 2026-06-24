import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/AppError';
import { env } from '../config/env';

interface MongoError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Operational errors — safe to show to client
  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
    return;
  }

  // MongoDB duplicate key error
  const mongoErr = err as MongoError;
  if (mongoErr.code === 11000 && mongoErr.keyValue) {
    const field = Object.keys(mongoErr.keyValue)[0];
    res.status(409).json({
      success: false,
      message: `${field} already exists`,
      errors: [{ field, message: `${field} must be unique` }],
    });
    return;
  }

  // MongoDB CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      message: 'Invalid ID format',
    });
    return;
  }

  // JWT errors (fallthrough from authenticate)
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({ success: false, message: 'Invalid token' });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({ success: false, message: 'Token expired' });
    return;
  }

  // Log unexpected errors in development
  if (env.NODE_ENV === 'development') {
    console.error('💥 Unexpected Error:', err);
  }

  // Generic server error — don't leak details in production
  res.status(500).json({
    success: false,
    message:
      env.NODE_ENV === 'development'
        ? err.message
        : 'An unexpected error occurred. Please try again later.',
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  next(AppError.notFound(`Route ${req.originalUrl}`));
};
