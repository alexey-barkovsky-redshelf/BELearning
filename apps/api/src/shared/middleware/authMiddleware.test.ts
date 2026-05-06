import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { requireAdmin, requireAuth, requireRole } from './authMiddleware.js';

const SECRET = 'auth-middleware-test-secret';

function mockRes(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function signTestToken(payload: { sub: string; email: string; role: string }): string {
  return jwt.sign({ email: payload.email, role: payload.role }, SECRET, {
    subject: payload.sub,
    expiresIn: '1h',
  });
}

describe('requireAuth', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = SECRET;
  });

  afterAll(() => {
    delete process.env.JWT_SECRET;
  });

  it('responds 401 when Authorization header is missing', () => {
    const req = { headers: {} } as Request;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(next).not.toHaveBeenCalled();
  });

  it('responds 401 when Bearer token is empty', () => {
    const req = { headers: { authorization: 'Bearer   ' } } as unknown as Request;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('responds 401 for invalid JWT', () => {
    const req = { headers: { authorization: 'Bearer not-a-jwt' } } as unknown as Request;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('responds 401 when sub is missing in payload', () => {
    const token = jwt.sign({ email: 'a@x.com', role: 'user' }, SECRET, { expiresIn: '1h' });
    const req = { headers: { authorization: `Bearer ${token}` } } as unknown as Request;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next and sets req.auth for valid Bearer token', () => {
    const token = signTestToken({
      sub: 'user-uuid',
      email: 'alice@example.com',
      role: 'user',
    });
    const req = { headers: { authorization: `Bearer ${token}` } } as unknown as Request;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(req.auth).toEqual({
      userId: 'user-uuid',
      email: 'alice@example.com',
      role: 'user',
    });
  });

  it('defaults role to user when role claim is missing', () => {
    const token = jwt.sign({ email: 'bob@example.com' }, SECRET, { subject: 'id-bob', expiresIn: '1h' });
    const req = { headers: { authorization: `Bearer ${token}` } } as unknown as Request;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.auth).toEqual({ userId: 'id-bob', email: 'bob@example.com', role: 'user' });
  });
});

describe('requireRole', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = SECRET;
  });

  afterAll(() => {
    delete process.env.JWT_SECRET;
  });

  it('responds 401 when req.auth is missing', () => {
    const req = {} as Request;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    requireRole('admin')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('responds 403 when role is not allowed', () => {
    const req = { auth: { userId: '1', email: 'u@x.com', role: 'user' } } as Request;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    requireRole('admin')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' });
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next when role matches', () => {
    const req = { auth: { userId: '1', email: 'admin@x.com', role: 'admin' } } as Request;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    requireRole('admin')(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('allows one of several roles', () => {
    const req = { auth: { userId: '1', email: 'm@x.com', role: 'moderator' } } as Request;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    requireRole('admin', 'moderator')(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe('requireAdmin', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = SECRET;
  });

  afterAll(() => {
    delete process.env.JWT_SECRET;
  });

  it('responds 401 when not authenticated', () => {
    const req = { headers: {} } as Request;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('responds 403 when authenticated but not admin', () => {
    const token = signTestToken({
      sub: 'u1',
      email: 'u@x.com',
      role: 'user',
    });
    const req = { headers: { authorization: `Bearer ${token}` } } as unknown as Request;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' });
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next when user is admin', () => {
    const token = signTestToken({
      sub: 'a1',
      email: 'a@x.com',
      role: 'admin',
    });
    const req = { headers: { authorization: `Bearer ${token}` } } as unknown as Request;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(req.auth).toEqual({
      userId: 'a1',
      email: 'a@x.com',
      role: 'admin',
    });
  });
});
