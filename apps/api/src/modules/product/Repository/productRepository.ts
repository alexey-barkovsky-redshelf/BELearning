import { BaseInMemoryRepository } from '../../../shared/repositories/index.js';
import { Product } from '../Models/index.js';
import type { IProductRepository } from '../Types/index.js';

export class InMemoryProductRepository extends BaseInMemoryRepository<Product> implements IProductRepository {
  public async findBySlug(slug: string): Promise<Product | null> {
    for (const p of this.store.values()) {
      if (p.slug === slug) {
        return p;
      }
    }
    return null;
  }

  public async findAll(): Promise<Product[]> {
    return Array.from(this.store.values());
  }

  public async findByCategory(category: string): Promise<Product[]> {
    return Array.from(this.store.values()).filter((p) => (p.categories ?? []).includes(category));
  }

  public async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }

  public async saveMany(entities: Product[]): Promise<void> {
    for (const entity of entities) {
      this.store.set(entity.id, entity);
    }
  }
}
