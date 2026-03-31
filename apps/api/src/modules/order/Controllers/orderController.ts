import type { Request, Response } from 'express';
import { createOrderBodySchema } from '@belearning/shared';
import { BaseController } from '../../../shared/controllers/index.js';
import { OrderService } from '../Services/index.js';

export class OrderController extends BaseController {
  public constructor(private readonly orderService: OrderService) {
    super();
  }

  public async create(req: Request, res: Response): Promise<void> {
    const parsed = createOrderBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', issues: parsed.error.flatten() });
      return;
    }
    const { userId, items, currency } = parsed.data;
    const order = await this.orderService.create(userId, items, currency);
    res.status(201).json(order);
  }

  public async getById(req: Request, res: Response): Promise<void> {
    await this.getByIdAndSend(req, res, 'Order', (id) => this.orderService.getById(id));
  }

  public async getByUserId(req: Request, res: Response): Promise<void> {
    const orders = await this.orderService.getByUserId(req.params.userId);
    res.json(orders);
  }

  public async markPaid(req: Request, res: Response): Promise<void> {
    const order = await this.orderService.markPaid(req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.json(order);
  }
}
