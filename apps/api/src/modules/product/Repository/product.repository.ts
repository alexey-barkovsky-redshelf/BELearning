import { Product } from '../Models/index.js';
import type { IProductRepository } from '../Types/index.js';

export class InMemoryProductRepository implements IProductRepository {
  private readonly store: Map<string, Product> = new Map();

  public async findById(id: string): Promise<Product | null> {
    return this.store.get(id) ?? null;
  }

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

  public async save(entity: Product): Promise<Product> {
    this.store.set(entity.id, entity);
    return entity;
  }

  public async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}
