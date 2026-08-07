import { randomUUID } from 'node:crypto';
import type { ListProductsQuery, PaginatedProducts, Product as IProduct } from '@belearning/shared';
import { BaseEntityService } from '../../../shared/services/index.js';
import { Product } from '../Models/index.js';
import type { IProductRepository } from '../Types/index.js';

export class ProductService extends BaseEntityService<Product, IProduct, IProductRepository> {
  public constructor(repository: IProductRepository) {
    super(repository);
  }

  public async list(query: ListProductsQuery): Promise<PaginatedProducts> {
    const { items, total } = await this.repository.listProducts(query);
    const { page, pageSize } = query;
    const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
    return {
      items: this.toPlains(items),
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  public async getBySlug(slug: string): Promise<IProduct | null> {
    return this.toPlain(await this.repository.findBySlug(slug));
  }

  public async create(data: Omit<IProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<IProduct> {
    const now = new Date().toISOString();
    const product = Product.create({
      id: randomUUID(),
      name: data.name,
      slug: data.slug,
      price: data.price,
      currency: data.currency ?? 'USD',
      description: data.description,
      categories: data.categories,
      manufacturer: data.manufacturer,
      createdAt: now,
      updatedAt: now,
    });
    await this.repository.save(product);
    return product.toJSON();
  }
}
