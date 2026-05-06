import type { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { LoginBody, RegisterBody } from '@belearning/shared';
import { jwtAuthConfig } from './jwtConfig.js';

export type AuthUserView = {
  id: string;
  email: string;
  role: string;
};

export class AuthService {
  public constructor(private readonly prisma: PrismaClient) {}

  public signAccessToken(user: AuthUserView): string {
    return jwt.sign({ email: user.email, role: user.role }, jwtAuthConfig.secret, {
      subject: user.id,
      expiresIn: jwtAuthConfig.expiresIn,
    });
  }

  public async register(body: RegisterBody): Promise<{ token: string; user: AuthUserView }> {
    const now = new Date().toISOString();
    const password = await bcrypt.hash(body.password, 10);
    const row = await this.prisma.user.create({
      data: {
        email: body.email,
        password,
        role: 'user',
        createdAt: now,
        updatedAt: now,
      },
    });
    const user: AuthUserView = { id: row.id, email: row.email, role: row.role };
    return { token: this.signAccessToken(user), user };
  }

  public async login(body: LoginBody): Promise<{ token: string; user: AuthUserView } | null> {
    const row = await this.prisma.user.findUnique({ where: { email: body.email } });
    if (!row) {
      return null;
    }
    const ok = await bcrypt.compare(body.password, row.password);
    if (!ok) {
      return null;
    }
    const user: AuthUserView = { id: row.id, email: row.email, role: row.role };
    return { token: this.signAccessToken(user), user };
  }
}
