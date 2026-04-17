import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error with context
  logger.error(`${req.method} ${req.originalUrl} - ${message}`, {
    stack: err.stack,
    body: req.body,
    params: req.params,
    query: req.query,
    userId: (req as any).userId,
  });

  // Security Rule: Never expose stack traces to users in production
  res.status(statusCode).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};
