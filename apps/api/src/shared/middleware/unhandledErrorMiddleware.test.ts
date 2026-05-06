import type { NextFunction, Request, Response } from 'express';
import { unhandledErrorMiddleware } from './unhandledErrorMiddleware.js';

describe('unhandledErrorMiddleware', () => {
  const savedNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = savedNodeEnv;
    jest.restoreAllMocks();
  });

  it('responds with 500 and error payload', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    process.env.NODE_ENV = 'development';
    const res = {
      headersSent: false,
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;
    const next = jest.fn() as NextFunction;
    unhandledErrorMiddleware(new Error('db down'), {} as Request, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'db down' });
    expect(next).not.toHaveBeenCalled();
  });

  it('uses generic message in production', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    process.env.NODE_ENV = 'production';
    const res = {
      headersSent: false,
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;
    unhandledErrorMiddleware(new Error('secret'), {} as Request, res, jest.fn() as NextFunction);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });

  it('does not write when headers already sent', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = {
      headersSent: true,
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;
    unhandledErrorMiddleware(new Error('x'), {} as Request, res, jest.fn() as NextFunction);
    expect(res.status).not.toHaveBeenCalled();
  });
});
