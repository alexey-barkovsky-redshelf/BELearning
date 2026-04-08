import { Prisma } from '@prisma/client';
import type { Request, Response } from 'express';
import type { LoginBody, RegisterBody } from '@belearning/shared';
import { AuthService } from './authService.js';

export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  public async register(req: Request, res: Response): Promise<void> {
    const body = req.validatedBody as RegisterBody;
    try {
      const result = await this.authService.register(body);
      res.status(201).json(result);
    } catch (e: unknown) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        res.status(409).json({ error: 'Login already taken' });
        return;
      }
      throw e;
    }
  }

  public async login(req: Request, res: Response): Promise<void> {
    const body = req.validatedBody as LoginBody;
    const result = await this.authService.login(body);
    if (!result) {
      res.status(401).json({ error: 'Invalid login or password' });
      return;
    }
    res.json(result);
  }
}
