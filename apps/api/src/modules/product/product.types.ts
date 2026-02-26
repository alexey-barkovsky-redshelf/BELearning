import type { Product } from './product.model.js';
import type { IRepository } from '../../shared/repositories/IRepository.js';

export interface IProductRepository extends IRepository<Product> {
  findBySlug(slug: string): Promise<Product | null>;
  findByCategory(category: string): Promise<Product[]>;
}
