import type { PrismaClient } from '@prisma/client';
import type { Request, Response } from 'express';
import type { OrderService } from '../order/Services/index.js';

export class AdminController {
  public constructor(
    private readonly prisma: PrismaClient,
    private readonly orderService: OrderService,
  ) {}

  public async listUsers(_req: Request, res: Response): Promise<void> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        loginId: true,
        role: true,
        createdAt: true,
      },
      orderBy: { loginId: 'asc' },
    });
    res.json(users);
  }

  public async listOrders(_req: Request, res: Response): Promise<void> {
    const orders = await this.orderService.findAll();
    res.json(orders);
  }
}
