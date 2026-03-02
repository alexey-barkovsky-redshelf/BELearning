import { Order } from '../Models/order.model.js';
import type { IOrderRepository } from '../Types/order.types.js';

export class InMemoryOrderRepository implements IOrderRepository {
  private readonly store = new Map<string, Order>();

  async findById(id: string): Promise<Order | null> {
    return this.store.get(id) ?? null;
  }

  async findByUserId(userId: string): Promise<Order[]> {
    return Array.from(this.store.values()).filter((o) => o.userId === userId);
  }

  async save(order: Order): Promise<Order> {
    this.store.set(order.id, order);
    return order;
  }
}
