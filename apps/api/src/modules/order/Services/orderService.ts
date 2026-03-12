import type { Order as IOrder } from '@belearning/shared';
import { BaseEntityService } from '../../../shared/services/index.js';
import { Order } from '../Models/index.js';
import type { IOrderRepository } from '../Types/index.js';

export class OrderService extends BaseEntityService<Order, IOrder, IOrderRepository> {
  public constructor(repository: IOrderRepository) {
    super(repository);
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
    await this.repository.save(order);
    return order.toJSON();
  }

  public async getByUserId(userId: string): Promise<IOrder[]> {
    return this.toPlains(await this.repository.findByUserId(userId));
  }

  public async markPaid(orderId: string): Promise<IOrder | null> {
    const order = await this.repository.findById(orderId);
    if (!order) {
      return null;
    }
    order.markPaid();
    await this.repository.save(order);
    return this.toPlain(order);
  }
}
