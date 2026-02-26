import { Product } from './product.model.js';
import type { IProductRepository } from './product.types.js';

export class InMemoryProductRepository implements IProductRepository {
  private readonly store = new Map<string, Product>();

  async findById(id: string): Promise<Product | null> {
    return this.store.get(id) ?? null;
  }

  async findBySlug(slug: string): Promise<Product | null> {
    for (const p of this.store.values()) {
      if (p.slug === slug) {
        return p;
      }
    }
    return null;
  }

  async findAll(): Promise<Product[]> {
    return Array.from(this.store.values());
  }

  async findByCategory(category: string): Promise<Product[]> {
    return Array.from(this.store.values()).filter((p) => (p.categories ?? []).includes(category));
  }

  async save(entity: Product): Promise<Product> {
    this.store.set(entity.id, entity);
    return entity;
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}
