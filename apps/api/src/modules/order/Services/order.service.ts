import type { Order as IOrder } from '@belearning/shared';
import { Order } from '../Models/index.js';
import type { IOrderRepository } from '../Types/index.js';

export class OrderService {
  private readonly orderRepository: IOrderRepository;

  public constructor(orderRepository: IOrderRepository) {
    this.orderRepository = orderRepository;
  }

  public async create(
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

  public async getById(id: string): Promise<IOrder | null> {
    const order = await this.orderRepository.findById(id);
    return order?.toJSON() ?? null;
  }

  public async getByUserId(userId: string): Promise<IOrder[]> {
    const orders = await this.orderRepository.findByUserId(userId);
    return orders.map((o) => o.toJSON());
  }

  public async markPaid(orderId: string): Promise<IOrder | null> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      return null;
    }
    order.markPaid();
    await this.orderRepository.save(order);
    return order.toJSON();
  }
}
