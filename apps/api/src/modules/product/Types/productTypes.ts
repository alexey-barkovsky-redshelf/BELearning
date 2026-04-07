import type { ListProductsQuery } from '@belearning/shared';
import type { Product } from '../Models/index.js';
import type { IRepository } from '../../../shared/repositories/index.js';

export interface IProductRepository extends IRepository<Product> {
  findBySlug(slug: string): Promise<Product | null>;
  findByCategory(category: string): Promise<Product[]>;
  listProducts(query: ListProductsQuery): Promise<{ items: Product[]; total: number }>;
  saveMany(entities: Product[]): Promise<void>;
}
