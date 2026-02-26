import type { Order as IOrder } from '@belearning/shared';
import { Order } from './order.model.js';
import type { IOrderRepository } from './order.types.js';

export class OrderService {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async create(
    userId: string,
    items: Array<{ productId: string; productTitle: string; priceAtPurchase: number; quantity: number }>,
    currency?: string
  ): Promise<IOrder> {
    const now = new Date().toISOString();
    const order = Order.create({
      id: crypto.randomUUID(),
      userId,
      items,
      currency: currency ?? 'USD',
      createdAt: now,
      updatedAt: now,
    });
    await this.orderRepository.save(order);
    return order.toJSON();
  }

  async getById(id: string): Promise<IOrder | null> {
    const order = await this.orderRepository.findById(id);
    return order?.toJSON() ?? null;
  }

  async getByUserId(userId: string): Promise<IOrder[]> {
    const orders = await this.orderRepository.findByUserId(userId);
    return orders.map((o) => o.toJSON());
  }

  async markPaid(orderId: string): Promise<IOrder | null> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      return null;
    }
    order.markPaid();
    await this.orderRepository.save(order);
    return order.toJSON();
  }
}
