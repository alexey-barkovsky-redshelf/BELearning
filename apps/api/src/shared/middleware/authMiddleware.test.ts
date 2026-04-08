import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { requireAuth, requireRole } from './authMiddleware.js';

const SECRET = 'auth-middleware-test-secret';

function mockRes(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function signTestToken(payload: { sub: string; loginId: string; role: string }): string {
  return jwt.sign({ loginId: payload.loginId, role: payload.role }, SECRET, {
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
    const token = jwt.sign({ loginId: 'a', role: 'user' }, SECRET, { expiresIn: '1h' });
    const req = { headers: { authorization: `Bearer ${token}` } } as unknown as Request;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next and sets req.auth for valid Bearer token', () => {
    const token = signTestToken({ sub: 'user-uuid', loginId: 'alice', role: 'user' });
    const req = { headers: { authorization: `Bearer ${token}` } } as unknown as Request;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(req.auth).toEqual({ userId: 'user-uuid', loginId: 'alice', role: 'user' });
  });

  it('defaults role to user when role claim is missing', () => {
    const token = jwt.sign({ loginId: 'bob' }, SECRET, { subject: 'id-bob', expiresIn: '1h' });
    const req = { headers: { authorization: `Bearer ${token}` } } as unknown as Request;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.auth).toEqual({ userId: 'id-bob', loginId: 'bob', role: 'user' });
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
    const req = { auth: { userId: '1', loginId: 'u', role: 'user' } } as Request;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    requireRole('admin')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' });
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next when role matches', () => {
    const req = { auth: { userId: '1', loginId: 'admin', role: 'admin' } } as Request;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    requireRole('admin')(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('allows one of several roles', () => {
    const req = { auth: { userId: '1', loginId: 'm', role: 'moderator' } } as Request;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    requireRole('admin', 'moderator')(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
