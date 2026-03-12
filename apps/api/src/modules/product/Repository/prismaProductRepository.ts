import type { PrismaClient } from '@prisma/client';
import { Product } from '../Models/index.js';
import type { IProductRepository } from '../Types/index.js';

function rowToProduct(row: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  categories: string | null;
  manufacturer: string | null;
  createdAt: string;
  updatedAt: string;
}): Product {
  return Product.fromPlain({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    price: row.price,
    currency: row.currency,
    categories: row.categories ? (JSON.parse(row.categories) as string[]) : undefined,
    manufacturer: row.manufacturer ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export class PrismaProductRepository implements IProductRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async findById(id: string): Promise<Product | null> {
    const row = await this.prisma.product.findUnique({ where: { id } });
    return row ? rowToProduct(row) : null;
  }

  public async findBySlug(slug: string): Promise<Product | null> {
    const row = await this.prisma.product.findUnique({ where: { slug } });
    return row ? rowToProduct(row) : null;
  }

  public async findAll(): Promise<Product[]> {
    const rows = await this.prisma.product.findMany();
    return rows.map(rowToProduct);
  }

  public async findByCategory(category: string): Promise<Product[]> {
    const rows = await this.prisma.product.findMany();
    return rows
      .filter((row) => {
        if (!row.categories) {
          return false;
        }
        const cats = JSON.parse(row.categories) as string[];
        return cats.includes(category);
      })
      .map(rowToProduct);
  }

  public async save(entity: Product): Promise<Product> {
    const d = entity.toJSON();
    await this.prisma.product.upsert({
      where: { id: entity.id },
      create: {
        id: d.id,
        name: d.name,
        slug: d.slug,
        description: d.description ?? null,
        price: d.price,
        currency: d.currency,
        categories: d.categories?.length ? JSON.stringify(d.categories) : null,
        manufacturer: d.manufacturer ?? null,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      },
      update: {
        name: d.name,
        slug: d.slug,
        description: d.description ?? null,
        price: d.price,
        currency: d.currency,
        categories: d.categories?.length ? JSON.stringify(d.categories) : null,
        manufacturer: d.manufacturer ?? null,
        updatedAt: d.updatedAt,
      },
    });
    return entity;
  }

  public async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.product.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  public async saveMany(entities: Product[]): Promise<void> {
    if (entities.length === 0) {
      return;
    }
    const data = entities.map((entity) => {
      const d = entity.toJSON();
      return {
        id: d.id,
        name: d.name,
        slug: d.slug,
        description: d.description ?? null,
        price: d.price,
        currency: d.currency,
        categories: d.categories?.length ? JSON.stringify(d.categories) : null,
        manufacturer: d.manufacturer ?? null,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      };
    });
    await this.prisma.product.createMany({ data });
  }
}
