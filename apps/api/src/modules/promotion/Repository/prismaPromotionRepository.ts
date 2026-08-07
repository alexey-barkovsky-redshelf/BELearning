import type { PrismaClient } from '@prisma/client';
import { Promotion } from '../Models/index.js';
import type { IPromotionRepository } from '../Types/index.js';

type PromotionProductRow = {
  promotionId: string;
  productId: string;
  discountPctOverride: number | null;
};

type PromotionRowWithProducts = {
  id: string;
  name: string;
  description: string | null;
  discountPct: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  productRows: PromotionProductRow[];
};

type PrismaPromotionClient = {
  promotion: {
    findUnique(args: { where: { id: string }; include: { productRows: true } }): Promise<PromotionRowWithProducts | null>;
    findMany(args: {
      where?: {
        AND?: Array<{ validFrom?: { lte: string }; validTo?: { gte: string }; isActive?: boolean }>;
        productRows?: { some: { productId: string } };
      };
      include: { productRows: true };
      orderBy?: { createdAt: 'asc' | 'desc' };
    }): Promise<PromotionRowWithProducts[]>;
    upsert(args: {
      where: { id: string };
      create: {
        id: string;
        name: string;
        description: string | null;
        discountPct: number;
        validFrom: string;
        validTo: string;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
      };
      update: {
        name: string;
        description: string | null;
        discountPct: number;
        validFrom: string;
        validTo: string;
        isActive: boolean;
        updatedAt: string;
      };
    }): Promise<unknown>;
  };
  promotionProduct: {
    deleteMany(args: { where: { promotionId: string } }): Promise<unknown>;
    createMany(args: {
      data: Array<{ promotionId: string; productId: string; discountPctOverride: number | null }>;
    }): Promise<unknown>;
  };
  $transaction<T>(fn: (tx: PrismaPromotionClient) => Promise<T>): Promise<T>;
};

function rowToEntity(row: PromotionRowWithProducts): Promotion {
  return Promotion.fromPlain({
    id: row.id,
    name: row.name,
    description: row.description,
    discountPct: row.discountPct,
    validFrom: row.validFrom,
    validTo: row.validTo,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    products: row.productRows.map((pp) => ({
      productId: pp.productId,
      discountPctOverride: pp.discountPctOverride,
    })),
  });
}

export class PrismaPromotionRepository implements IPromotionRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  private get client(): PrismaPromotionClient {
    return this.prisma as unknown as PrismaPromotionClient;
  }

  public async findAll(): Promise<Promotion[]> {
    const rows = await this.client.promotion.findMany({
      include: { productRows: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(rowToEntity);
  }

  public async findById(id: string): Promise<Promotion | null> {
    const row = await this.client.promotion.findUnique({
      where: { id },
      include: { productRows: true },
    });
    return row ? rowToEntity(row) : null;
  }

  public async findActiveAt(at: Date): Promise<Promotion[]> {
    const iso = at.toISOString();
    const rows = await this.client.promotion.findMany({
      where: {
        AND: [{ validFrom: { lte: iso } }, { validTo: { gte: iso } }, { isActive: true }],
      },
      include: { productRows: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(rowToEntity);
  }

  public async findByProductId(productId: string): Promise<Promotion[]> {
    const rows = await this.client.promotion.findMany({
      where: { productRows: { some: { productId } } },
      include: { productRows: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(rowToEntity);
  }

  public async save(entity: Promotion): Promise<Promotion> {
    const data = entity.toJSON();
    await this.client.$transaction(async (tx) => {
      await tx.promotion.upsert({
        where: { id: data.id },
        create: {
          id: data.id,
          name: data.name,
          description: data.description ?? null,
          discountPct: data.discountPct,
          validFrom: data.validFrom,
          validTo: data.validTo,
          isActive: data.isActive,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        },
        update: {
          name: data.name,
          description: data.description ?? null,
          discountPct: data.discountPct,
          validFrom: data.validFrom,
          validTo: data.validTo,
          isActive: data.isActive,
          updatedAt: data.updatedAt,
        },
      });
      await tx.promotionProduct.deleteMany({ where: { promotionId: data.id } });
      if (data.products.length > 0) {
        await tx.promotionProduct.createMany({
          data: data.products.map((p: { productId: string; discountPctOverride?: number | null }) => ({
            promotionId: data.id,
            productId: p.productId,
            discountPctOverride: p.discountPctOverride ?? null,
          })),
        });
      }
    });
    return entity;
  }
}
