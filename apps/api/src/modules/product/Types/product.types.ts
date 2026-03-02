import type { Product } from '../Models/index.js';
import type { IRepository } from '../../../shared/repositories/index.js';

export interface IProductRepository extends IRepository<Product> {
  findBySlug(slug: string): Promise<Product | null>;
  findByCategory(category: string): Promise<Product[]>;
}
