import { Order } from '../Models/index.js';
import type { IOrderRepository } from '../Types/index.js';

export class InMemoryOrderRepository implements IOrderRepository {
  private readonly store: Map<string, Order> = new Map();

  public async findById(id: string): Promise<Order | null> {
    return this.store.get(id) ?? null;
  }

  public async findByUserId(userId: string): Promise<Order[]> {
    return Array.from(this.store.values()).filter((o) => o.userId === userId);
  }

  public async save(order: Order): Promise<Order> {
    this.store.set(order.id, order);
    return order;
  }
}
