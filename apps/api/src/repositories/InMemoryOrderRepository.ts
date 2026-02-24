import { Order } from '../domain/Order.js';
import type { IOrderRepository } from './interfaces/IOrderRepository.js';

export class InMemoryOrderRepository implements IOrderRepository {
  private readonly store = new Map<string, Order>();

  async findById(id: string): Promise<Order | null> {
    return this.store.get(id) ?? null;
  }

  async findByUserId(userId: string): Promise<Order[]> {
    return Array.from(this.store.values()).filter((o) => {
      return o.userId === userId;
    });
  }

  async save(order: Order): Promise<Order> {
    this.store.set(order.id, order);
    return order;
  }
}
