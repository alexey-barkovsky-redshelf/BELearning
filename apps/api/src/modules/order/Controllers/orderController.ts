import type { Request, Response } from 'express';
import type { CreateOrderBody } from '@belearning/shared';
import { BaseController } from '../../../shared/controllers/index.js';
import type { AuthContext } from '../../../shared/middleware/authMiddleware.js';
import { OrderService } from '../Services/index.js';

export class OrderController extends BaseController {
  public constructor(private readonly orderService: OrderService) {
    super();
  }

  private getAuth(req: Request): AuthContext {
    return req.auth as AuthContext;
  }

  public async create(req: Request, res: Response): Promise<void> {
    const auth = this.getAuth(req);
    const { items, currency } = req.validatedBody as CreateOrderBody;
    const order = await this.orderService.create(auth.userId, items, currency);
    res.status(201).json(order);
  }

  public async listMine(req: Request, res: Response): Promise<void> {
    const auth = this.getAuth(req);
    const orders = await this.orderService.getByUserId(auth.userId);
    res.json(orders);
  }

  public async getById(req: Request, res: Response): Promise<void> {
    const auth = this.getAuth(req);
    const id = (req.validatedParams as { id: string }).id;
    const order = await this.orderService.getById(id);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    if (order.userId !== auth.userId && auth.role !== 'admin') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    res.json(order);
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
