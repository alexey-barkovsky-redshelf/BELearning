import type { Request, Response } from 'express';
import { OrderService } from '../services/OrderService.js';

function assertCreateOrderBody(body: unknown): asserts body is { userId: string; items: Array<{ productId: string; productTitle: string; priceAtPurchase: number; quantity: number }>; currency?: string } {
  if (!body || typeof body !== 'object') {
    throw new Error('Request body is required');
  }
  const b = body as Record<string, unknown>;
  if (typeof b.userId !== 'string' || !b.userId.trim()) {
    throw new Error('userId must be a non-empty string');
  }
  if (!Array.isArray(b.items) || b.items.length === 0) {
    throw new Error('items must be a non-empty array');
  }
  for (const item of b.items as unknown[]) {
    if (!item || typeof item !== 'object') {
      throw new Error('Each item must have productId, productTitle, priceAtPurchase, quantity');
    }
    const i = item as Record<string, unknown>;
    if (typeof i.productId !== 'string' || typeof i.productTitle !== 'string' || typeof i.priceAtPurchase !== 'number' || typeof i.quantity !== 'number') {
      throw new Error('Each item must have productId, productTitle, priceAtPurchase, quantity');
    }
  }
}

export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      assertCreateOrderBody(req.body);
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Invalid request body' });
      return;
    }
    const { userId, items, currency } = req.body as { userId: string; items: Array<{ productId: string; productTitle: string; priceAtPurchase: number; quantity: number }>; currency?: string };
    const order = await this.orderService.create(userId, items, currency);
    res.status(201).json(order);
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
    const order = await this.orderService.markPaid(req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.json(order);
  }
}
