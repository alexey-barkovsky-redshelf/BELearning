import type { Product as IProduct } from '@belearning/shared';
import { Product } from './product.model.js';
import type { IProductRepository } from './product.types.js';

export class ProductService {
  constructor(private readonly productRepository: IProductRepository) {}

  async list(category?: string): Promise<IProduct[]> {
    const list = category
      ? await this.productRepository.findByCategory(category)
      : await this.productRepository.findAll();
    return list.map((p) => p.toJSON());
  }

  async getById(id: string): Promise<IProduct | null> {
    const product = await this.productRepository.findById(id);
    return product?.toJSON() ?? null;
  }

  async getBySlug(slug: string): Promise<IProduct | null> {
    const product = await this.productRepository.findBySlug(slug);
    return product?.toJSON() ?? null;
  }

  async create(data: Omit<IProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<IProduct> {
    const now = new Date().toISOString();
    const product = Product.create({
      id: crypto.randomUUID(),
      name: data.name,
      slug: data.slug,
      price: data.price,
      currency: data.currency ?? 'USD',
      description: data.description,
      categories: data.categories,
      createdAt: now,
      updatedAt: now,
    });
    await this.productRepository.save(product);
    return product.toJSON();
  }
}
