import type { PrismaClient } from '@prisma/client';
import { Category } from '../Models/index.js';
import type { ICategoryRepository } from '../Types/index.js';

type CategoryRow = {
  code: string;
  name: string;
  parentCode: string | null;
  createdAt: string;
  updatedAt: string;
};

function rowToEntity(row: CategoryRow): Category {
  return Category.create({
    code: row.code,
    name: row.name,
    parentCode: row.parentCode,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

type PrismaCategoryClient = {
  category: {
    findMany(args?: {
      where?: { parentCode?: string | null };
      orderBy?: { code: 'asc' | 'desc' };
    }): Promise<CategoryRow[]>;
    findUnique(args: { where: { code: string } }): Promise<CategoryRow | null>;
    upsert(args: {
      where: { code: string };
      create: CategoryRow;
      update: { name: string; parentCode: string | null; updatedAt: string };
    }): Promise<CategoryRow>;
  };
};

export class PrismaCategoryRepository implements ICategoryRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async findAll(): Promise<Category[]> {
    const client = this.prisma as unknown as PrismaCategoryClient;
    const rows = await client.category.findMany({ orderBy: { code: 'asc' } });
    return rows.map(rowToEntity);
  }

  public async findByCode(code: string): Promise<Category | null> {
    const client = this.prisma as unknown as PrismaCategoryClient;
    const row = await client.category.findUnique({ where: { code } });
    return row ? rowToEntity(row) : null;
  }

  public async findRoots(): Promise<Category[]> {
    const client = this.prisma as unknown as PrismaCategoryClient;
    const rows = await client.category.findMany({
      where: { parentCode: null },
      orderBy: { code: 'asc' },
    });
    return rows.map(rowToEntity);
  }

  public async findChildrenOf(parentCode: string): Promise<Category[]> {
    const client = this.prisma as unknown as PrismaCategoryClient;
    const rows = await client.category.findMany({
      where: { parentCode },
      orderBy: { code: 'asc' },
    });
    return rows.map(rowToEntity);
  }

  public async upsertMany(categories: Category[]): Promise<void> {
    const client = this.prisma as unknown as PrismaCategoryClient;
    for (const c of categories) {
      await client.category.upsert({
        where: { code: c.code },
        create: {
          code: c.code,
          name: c.name,
          parentCode: c.parentCode,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        },
        update: {
          name: c.name,
          parentCode: c.parentCode,
          updatedAt: c.updatedAt,
        },
      });
    }
  }
}
