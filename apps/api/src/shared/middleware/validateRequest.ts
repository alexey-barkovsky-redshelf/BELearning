import type { NextFunction, Request, Response } from 'express';
import type { z } from 'zod';

function sendValidationError(res: Response, error: z.ZodError): void {
  res.status(400).json({ error: 'Validation failed', issues: error.flatten() });
}

type RequestSlice = 'body' | 'query' | 'params';

function createValidator<Schema extends z.ZodType>(slice: RequestSlice, schema: Schema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const raw = slice === 'body' ? req.body : slice === 'query' ? req.query : req.params;
    const result = schema.safeParse(raw);
    if (!result.success) {
      sendValidationError(res, result.error);
      return;
    }
    if (slice === 'body') {
      req.validatedBody = result.data;
    } else if (slice === 'query') {
      req.validatedQuery = result.data;
    } else {
      req.validatedParams = result.data;
    }
    next();
  };
}

export function validateBody<Schema extends z.ZodType>(schema: Schema) {
  return createValidator('body', schema);
}

export function validateQuery<Schema extends z.ZodType>(schema: Schema) {
  return createValidator('query', schema);
}

export function validateParams<Schema extends z.ZodType>(schema: Schema) {
  return createValidator('params', schema);
}
