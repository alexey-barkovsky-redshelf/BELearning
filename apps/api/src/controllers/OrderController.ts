import type { Request, Response } from 'express';
import { DomainError } from '../domain/errors.js';
import { OrderService } from '../services/OrderService.js';

export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  async create(req: Request, res: Response): Promise<void> {
    const userId = req.body.userId as string;
    const items = req.body.items as Array<{
      productId: string;
      productTitle: string;
      priceAtPurchase: number;
      quantity: number;
    }>;
    if (!userId || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'userId and non-empty items are required' });
      return;
    }
    try {
      const order = await this.orderService.create(userId, items, req.body.currency);
      res.status(201).json(order);
    } catch (err) {
      if (err instanceof DomainError) {
        res.status(400).json({ error: err.message, code: err.code });
        return;
      }
      throw err;
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    const order = await this.orderService.getById(req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.json(order);
  }

  async getByUserId(req: Request, res: Response): Promise<void> {
    const orders = await this.orderService.getByUserId(req.params.userId);
    res.json(orders);
  }

  async markPaid(req: Request, res: Response): Promise<void> {
    try {
      const order = await this.orderService.markPaid(req.params.id);
      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }
      res.json(order);
    } catch (err) {
      if (err instanceof DomainError) {
        res.status(400).json({ error: err.message, code: err.code });
        return;
      }
      throw err;
    }
  }
}
