import { UserProductAccess } from '../domain/UserProductAccess.js';
import type { IUserProductAccessRepository } from './interfaces/IUserProductAccessRepository.js';

function key(userId: string, productId: string): string {
  return `${userId}:${productId}`;
}

export class InMemoryUserProductAccessRepository implements IUserProductAccessRepository {
  private readonly store = new Map<string, UserProductAccess>();

  async findByUserAndProduct(userId: string, productId: string): Promise<UserProductAccess | null> {
    return this.store.get(key(userId, productId)) ?? null;
  }

  async findByUserId(userId: string): Promise<UserProductAccess[]> {
    return Array.from(this.store.values()).filter((a) => {
      return a.userId === userId;
    });
  }

  async save(access: UserProductAccess): Promise<UserProductAccess> {
    this.store.set(key(access.userId, access.productId), access);
    return access;
  }
}
