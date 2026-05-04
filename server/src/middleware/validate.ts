import type { Request, Response, NextFunction } from 'express';
import { ZodError, type ZodSchema } from 'zod';
import { logger } from '../utils/logger.js';

export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Update request with sanitized/transformed data
      if (parsed.body) req.body = parsed.body;
      if (parsed.query) Object.assign(req.query, parsed.query);
      if (parsed.params) Object.assign(req.params, parsed.params);

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map(err => ({
          path: err.path.join('.'),
          msg: err.message,
        }));

        logger.warn(`Validation failed for ${req.method} ${req.originalUrl}:`, { errors });

        return res.status(400).json({
          message: 'Validation failed',
          errors,
        });
      }
      return next(error);
    }
  };
};
