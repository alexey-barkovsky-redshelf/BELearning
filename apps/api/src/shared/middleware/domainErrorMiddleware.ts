import type { Request, Response, NextFunction } from 'express';
import { DomainError } from '../errors/DomainError.js';

export function domainErrorMiddleware(err: unknown, _req: Request, res: Response, next: NextFunction): void {
  if (err instanceof DomainError) {
    res.status(400).json({ error: err.message, code: err.code });
    return;
  }
  next(err);
}
