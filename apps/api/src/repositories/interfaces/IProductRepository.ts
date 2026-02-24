import type { Product } from '../../domain/Product.js';
import type { IRepository } from './IRepository.js';

export interface IProductRepository extends IRepository<Product> {
  findBySlug(slug: string): Promise<Product | null>;
  findByCategory(category: string): Promise<Product[]>;
}
