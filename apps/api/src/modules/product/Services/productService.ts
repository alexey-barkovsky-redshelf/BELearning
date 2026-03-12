import type { Product as IProduct } from '@belearning/shared';
import { BaseEntityService } from '../../../shared/services/index.js';
import { Product } from '../Models/index.js';
import type { IProductRepository } from '../Types/index.js';

export class ProductService extends BaseEntityService<Product, IProduct, IProductRepository> {
  public constructor(repository: IProductRepository) {
    super(repository);
  }

  public async list(category?: string): Promise<IProduct[]> {
    const list = category
      ? await this.repository.findByCategory(category)
      : await this.repository.findAll();
    return this.toPlains(list);
  }

  public async getBySlug(slug: string): Promise<IProduct | null> {
    return this.toPlain(await this.repository.findBySlug(slug));
  }

  public async create(data: Omit<IProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<IProduct> {
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
    await this.repository.save(product);
    return product.toJSON();
  }
}
