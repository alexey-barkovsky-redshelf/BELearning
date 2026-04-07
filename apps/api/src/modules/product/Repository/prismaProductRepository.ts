import type { Prisma, PrismaClient, Product as PrismaProductRow } from '@prisma/client';
import type { ListProductsQuery, ProductCategoryCode } from '@belearning/shared';
import { Product as ProductEntity } from '../Models/index.js';
import type { IProductRepository } from '../Types/index.js';

type ProductCategoryJoinRow = { productId: string; code: string };

type ProductWithCategories = PrismaProductRow & { categoryRows: ProductCategoryJoinRow[] };

type PrismaTransactionClientProductSave = {
  product: PrismaClient['product'];
  productCategory: {
    deleteMany(args: { where: { productId: string } }): Promise<unknown>;
    createMany(args: { data: Array<{ productId: string; code: string }> }): Promise<unknown>;
  };
};

const productIncludeCategoryRows = { categoryRows: true };

function rowToProduct(row: ProductWithCategories): ProductEntity {
  const codes =
    row.categoryRows.length > 0
      ? row.categoryRows.map((r) => r.code as ProductCategoryCode)
      : undefined;
  return ProductEntity.fromPlain({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    price: row.price,
    currency: row.currency,
    categories: codes,
    manufacturer: row.manufacturer ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export class PrismaProductRepository implements IProductRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async findById(id: string): Promise<ProductEntity | null> {
    const row = (await this.prisma.product.findUnique({
      where: { id },
      include: productIncludeCategoryRows,
    } as Prisma.ProductFindUniqueArgs)) as ProductWithCategories | null;
    return row ? rowToProduct(row) : null;
  }

  public async findBySlug(slug: string): Promise<ProductEntity | null> {
    const row = (await this.prisma.product.findUnique({
      where: { slug },
      include: productIncludeCategoryRows,
    } as Prisma.ProductFindUniqueArgs)) as ProductWithCategories | null;
    return row ? rowToProduct(row) : null;
  }

  public async findAll(): Promise<ProductEntity[]> {
    const rows = (await this.prisma.product.findMany({
      include: productIncludeCategoryRows,
    } as Prisma.ProductFindManyArgs)) as ProductWithCategories[];
    return rows.map(rowToProduct);
  }

  public async findByCategory(category: string): Promise<ProductEntity[]> {
    const rows = (await this.prisma.product.findMany({
      where: { categoryRows: { some: { code: category } } },
      include: productIncludeCategoryRows,
    } as Prisma.ProductFindManyArgs)) as ProductWithCategories[];
    return rows.map(rowToProduct);
  }

  public async listProducts(query: ListProductsQuery): Promise<{ items: ProductEntity[]; total: number }> {
    const where = this.buildWhere(query);
    const orderBy = this.buildOrderBy(query);
    const skip = (query.page - 1) * query.pageSize;
    const take = query.pageSize;

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take,
        include: productIncludeCategoryRows,
      } as Prisma.ProductFindManyArgs),
    ]);

    return {
      items: (rows as ProductWithCategories[]).map(rowToProduct),
      total,
    };
  }

  private buildWhere(query: ListProductsQuery): Prisma.ProductWhereInput {
    const parts: Prisma.ProductWhereInput[] = [];

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      const price: Prisma.FloatFilter = {};
      if (query.minPrice !== undefined) {
        price.gte = query.minPrice;
      }
      if (query.maxPrice !== undefined) {
        price.lte = query.maxPrice;
      }
      parts.push({ price });
    }

    if (query.search !== undefined) {
      const s = query.search;
      parts.push({
        OR: [{ name: { contains: s } }, { manufacturer: { contains: s } }],
      });
    }

    if (query.category !== undefined && query.category.length > 0) {
      parts.push({
        categoryRows: {
          some: { code: { in: query.category } },
        },
      } as Prisma.ProductWhereInput);
    }

    if (parts.length === 0) {
      return {};
    }
    if (parts.length === 1) {
      return parts[0] as Prisma.ProductWhereInput;
    }
    return { AND: parts };
  }

  private buildOrderBy(query: ListProductsQuery): Prisma.ProductOrderByWithRelationInput {
    const dir = query.order;
    switch (query.sortBy) {
      case 'price':
        return { price: dir };
      case 'createdAt':
        return { createdAt: dir };
      default:
        return { name: dir };
    }
  }

  public async save(entity: ProductEntity): Promise<ProductEntity> {
    const d = entity.toJSON();
    await this.prisma.$transaction(async (tx) => {
      const txx = tx as unknown as PrismaTransactionClientProductSave;
      await txx.product.upsert({
        where: { id: entity.id },
        create: {
          id: d.id,
          name: d.name,
          slug: d.slug,
          description: d.description ?? null,
          price: d.price,
          currency: d.currency,
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
          manufacturer: d.manufacturer ?? null,
          updatedAt: d.updatedAt,
        },
      });
      await txx.productCategory.deleteMany({ where: { productId: entity.id } });
      if (d.categories?.length) {
        await txx.productCategory.createMany({
          data: d.categories.map((code: string) => ({ productId: entity.id, code })),
        });
      }
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

  public async saveMany(entities: ProductEntity[]): Promise<void> {
    for (const entity of entities) {
      await this.save(entity);
    }
  }
}
