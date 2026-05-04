import type { Request, Response, NextFunction } from 'express';
import { ZodError, type ZodSchema } from 'zod';
import { logger } from '../utils/logger.js';

export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // We parse the full request structure
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Update request with sanitized data
      if (parsed.body) req.body = parsed.body;
      if (parsed.query) Object.assign(req.query, parsed.query);
      if (parsed.params) Object.assign(req.params, parsed.params);

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map(err => {
          // Normalize path: If it doesn't start with body/query/params, 
          // it likely came from an unwrapped schema, but our tests expect 'body.field'
          let path = err.path.join('.');
          if (!path.startsWith('body.') && !path.startsWith('query.') && !path.startsWith('params.')) {
            // Check if this issue belongs to the 'body' branch of the input
            if (err.path[0] === 'body') {
              path = err.path.join('.');
            } else {
              // Fallback for flat schemas: prepend 'body.' if we think it's a body error
              path = `body.${path}`;
            }
          }
          
          return {
            path,
            msg: err.message,
          };
        });

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
