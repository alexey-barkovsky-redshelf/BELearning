import type { NextFunction, Request, Response } from 'express';
import type { z } from 'zod';

function sendValidationError(res: Response, error: z.ZodError): void {
  res.status(400).json({ error: 'Validation failed', issues: error.flatten() });
}

export function validateBody<Schema extends z.ZodType>(schema: Schema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      sendValidationError(res, result.error);
      return;
    }
    req.validatedBody = result.data;
    next();
  };
}

export function validateQuery<Schema extends z.ZodType>(schema: Schema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      sendValidationError(res, result.error);
      return;
    }
    req.validatedQuery = result.data;
    next();
  };
}

export function validateParams<Schema extends z.ZodType>(schema: Schema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      sendValidationError(res, result.error);
      return;
    }
    req.validatedParams = result.data;
    next();
  };
}
