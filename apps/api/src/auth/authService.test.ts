import type { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { AuthService } from './authService.js';

const SECRET = 'auth-service-test-secret';

describe('AuthService', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = SECRET;
  });

  afterAll(() => {
    delete process.env.JWT_SECRET;
  });

  describe('signAccessToken', () => {
    it('produces a JWT with sub, email, and role', () => {
      const prisma = { user: { create: jest.fn(), findUnique: jest.fn() } } as unknown as PrismaClient;
      const svc = new AuthService(prisma);
      const token = svc.signAccessToken({
        id: 'uid-1',
        email: 'tester@example.com',
        role: 'admin',
      });
      const decoded = jwt.verify(token, SECRET) as jwt.JwtPayload;
      expect(decoded.sub).toBe('uid-1');
      expect(decoded.email).toBe('tester@example.com');
      expect(decoded.role).toBe('admin');
    });
  });

  describe('register', () => {
    it('creates user with role user and returns verifiable token', async () => {
      const prisma = {
        user: {
          create: jest.fn().mockResolvedValue({
            id: 'new-id',
            email: 'reg@example.com',
            role: 'user',
            password: 'hash',
            createdAt: 't',
            updatedAt: 't',
          }),
          findUnique: jest.fn(),
        },
      } as unknown as PrismaClient;
      const svc = new AuthService(prisma);

      const out = await svc.register({
        email: 'reg@example.com',
        password: 'password123',
      });

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'reg@example.com',
            role: 'user',
          }),
        }),
      );
      expect(out.user).toEqual({ id: 'new-id', email: 'reg@example.com', role: 'user' });
      const decoded = jwt.verify(out.token, SECRET) as jwt.JwtPayload;
      expect(decoded.sub).toBe('new-id');
      expect(decoded.role).toBe('user');
      const createData = (prisma.user.create as jest.Mock).mock.calls[0][0].data;
      expect(createData.password).not.toBe('password123');
      expect(typeof createData.password).toBe('string');
    });
  });

  describe('login', () => {
    it('returns null when user does not exist', async () => {
      const prisma = {
        user: {
          create: jest.fn(),
          findUnique: jest.fn().mockResolvedValue(null),
        },
      } as unknown as PrismaClient;
      const svc = new AuthService(prisma);

      const out = await svc.login({ email: 'nobody@example.com', password: 'x' });

      expect(out).toBeNull();
    });

    it('returns null when password does not match', async () => {
      const prisma = {
        user: {
          create: jest.fn(),
          findUnique: jest.fn().mockResolvedValue({
            id: 'id',
            email: 'a@example.com',
            password: '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            role: 'user',
            createdAt: '',
            updatedAt: '',
          }),
        },
      } as unknown as PrismaClient;
      const svc = new AuthService(prisma);

      const out = await svc.login({ email: 'a@example.com', password: 'wrong-password' });

      expect(out).toBeNull();
    });

    it('returns token and user when credentials match', async () => {
      type Row = {
        id: string;
        email: string;
        password: string;
        role: string;
        createdAt: string;
        updatedAt: string;
      };
      let row: Row | null = null;
      const prisma = {
        user: {
          create: jest.fn(
            async ({ data }: { data: { email: string; password: string; role: string } }) => {
              row = {
                id: 'stored-id',
                email: data.email,
                password: data.password,
                role: data.role,
                createdAt: 't',
                updatedAt: 't',
              };
              return row;
            },
          ),
          findUnique: jest.fn(async ({ where }: { where: { email: string } }) => {
            if (row !== null && row.email === where.email) {
              return row;
            }
            return null;
          }),
        },
      } as unknown as PrismaClient;

      const svc = new AuthService(prisma);
      await svc.register({
        email: 'ok@example.com',
        password: 'same-password',
      });
      const out = await svc.login({ email: 'ok@example.com', password: 'same-password' });

      expect(out).not.toBeNull();
      if (out === null) {
        return;
      }
      expect(out.user).toEqual({
        id: 'stored-id',
        email: 'ok@example.com',
        role: 'user',
      });
      const decoded = jwt.verify(out.token, SECRET) as jwt.JwtPayload;
      expect(decoded.sub).toBe('stored-id');
    });
  });
});
