import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod'; import type { AnyZodObject } from 'zod';
import { logger } from '../utils/logger.js';

export const validate = (schema: AnyZodObject) => {
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
        logger.warn(`Validation failed for ${req.method} ${req.originalUrl}: ${JSON.stringify(error.issues)}`, {
          body: req.body,
        });
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: (error.issues || []).map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      return next(error);
    }
  };
};
