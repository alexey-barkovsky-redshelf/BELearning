import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../../auth/jwtSecret.js';

export type AuthContext = {
  userId: string;
  loginId: string;
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
    const payload = jwt.verify(token, getJwtSecret()) as jwt.JwtPayload;
    const sub = typeof payload.sub === 'string' ? payload.sub : '';
    const loginId = typeof payload.loginId === 'string' ? payload.loginId : '';
    const role = typeof payload.role === 'string' ? payload.role : 'user';
    if (!sub) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
    req.auth = { userId: sub, loginId, role };
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
