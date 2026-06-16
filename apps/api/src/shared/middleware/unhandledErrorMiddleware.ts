import type { Request, Response, NextFunction } from 'express';

export function unhandledErrorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (res.headersSent) {
    return;
  }
  console.error(err);
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  const message =
    nodeEnv === 'production'
      ? 'Internal server error'
      : err instanceof Error
        ? err.message
        : 'Internal server error';
  res.status(500).json({ error: message });
}
