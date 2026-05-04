import type { Request, Response, NextFunction } from 'express';
import { ZodError, type ZodSchema } from 'zod';
import { logger } from '../utils/logger.js';

export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = {
        body: req.body,
        query: req.query,
        params: req.params,
      };

      const parsed = await schema.parseAsync(input);

      // Update request with sanitized data
      if (parsed.body) req.body = parsed.body;
      if (parsed.query) Object.assign(req.query, parsed.query);
      if (parsed.params) Object.assign(req.params, parsed.params);

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Debug: log raw issues to diagnose CI path mismatches
        console.error('[VALIDATE DEBUG] Raw Zod issues:', JSON.stringify(error.issues.map(i => ({ path: i.path, msg: i.message, code: i.code }))));
        console.error('[VALIDATE DEBUG] Request body keys:', Object.keys(req.body || {}));

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
