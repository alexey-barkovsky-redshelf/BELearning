import type { Order as IOrder } from '@belearning/shared';
import { Order } from '../domain/Order.js';
import type { IOrderRepository } from '../repositories/interfaces/IOrderRepository.js';

export class OrderService {
  constructor(private readonly orderRepository: IOrderRepository) {}

  /** Default currency is USD when not provided; same default as Order.create in domain. */
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
