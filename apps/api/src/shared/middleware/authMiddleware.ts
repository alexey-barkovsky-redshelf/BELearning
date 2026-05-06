import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { jwtAuthConfig } from '../../auth/jwtConfig.js';

export type AuthContext = {
  userId: string;
  email: string;
  role: string;
};

function readBearerToken(req: Request): string | null {
  const raw = req.headers.authorization;
  if (raw === undefined || typeof raw !== 'string' || !raw.startsWith('Bearer ')) {
    return null;
  }
  const t = raw.slice(7).trim();
  return t.length > 0 ? t : null;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = readBearerToken(req);
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const payload = jwt.verify(token, jwtAuthConfig.secret) as jwt.JwtPayload;
    const sub = typeof payload.sub === 'string' ? payload.sub : '';
    const email = typeof payload.email === 'string' ? payload.email : '';
    const role = typeof payload.role === 'string' ? payload.role : 'user';
    if (!sub) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
    req.auth = { userId: sub, email, role };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireRole(...allowed: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (!allowed.includes(req.auth.role)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    next();
  };
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    requireRole('admin')(req, res, next);
  });
}
