import { BaseInMemoryRepository } from '../../../shared/repositories/index.js';
import { Order } from '../Models/index.js';
import type { IOrderRepository } from '../Types/index.js';

export class InMemoryOrderRepository extends BaseInMemoryRepository<Order> implements IOrderRepository {
  public async findByUserId(userId: string): Promise<Order[]> {
    return Array.from(this.store.values()).filter((o) => o.userId === userId);
  }
}
