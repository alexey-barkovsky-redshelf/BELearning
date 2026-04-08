import type { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { LoginBody, RegisterBody } from '@belearning/shared';
import { getJwtSecret } from './jwtSecret.js';

export type AuthUserView = {
  id: string;
  loginId: string;
  role: string;
};

export class AuthService {
  public constructor(private readonly prisma: PrismaClient) {}

  public signAccessToken(user: AuthUserView): string {
    return jwt.sign({ loginId: user.loginId, role: user.role }, getJwtSecret(), {
      subject: user.id,
      expiresIn: '7d',
    });
  }

  public async register(body: RegisterBody): Promise<{ token: string; user: AuthUserView }> {
    const now = new Date().toISOString();
    const passwordHash = await bcrypt.hash(body.password, 10);
    const row = await this.prisma.user.create({
      data: {
        loginId: body.loginId,
        passwordHash,
        role: 'user',
        createdAt: now,
        updatedAt: now,
      },
    });
    const user: AuthUserView = { id: row.id, loginId: row.loginId, role: row.role };
    return { token: this.signAccessToken(user), user };
  }

  public async login(body: LoginBody): Promise<{ token: string; user: AuthUserView } | null> {
    const row = await this.prisma.user.findUnique({ where: { loginId: body.loginId } });
    if (!row) {
      return null;
    }
    const ok = await bcrypt.compare(body.password, row.passwordHash);
    if (!ok) {
      return null;
    }
    const user: AuthUserView = { id: row.id, loginId: row.loginId, role: row.role };
    return { token: this.signAccessToken(user), user };
  }
}
