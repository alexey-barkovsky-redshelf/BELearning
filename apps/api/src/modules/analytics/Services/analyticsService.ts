import { Prisma, type PrismaClient } from '@prisma/client';

export interface OrderStatusCount {
  status: string;
  count: number;
}

export interface OrdersPerUser {
  userId: string;
  count: number;
}

export interface TopProductRow {
  productId: string;
  totalQuantity: number;
}

export interface RevenueByCategoryMonthRow {
  categoryCode: string;
  yearMonth: string;
  revenue: number;
  totalQty: number;
  orders: number;
}

export class AnalyticsService {
  public constructor(private readonly prisma: PrismaClient) {}

  public async countActivePromotions(at: Date = new Date()): Promise<number> {
    const iso = at.toISOString();
    return this.prisma.promotion.count({
      where: {
        AND: [{ validFrom: { lte: iso } }, { validTo: { gte: iso } }, { isActive: true }],
      },
    });
  }

  public async averageProductPrice(): Promise<number | null> {
    const result = await this.prisma.product.aggregate({ _avg: { price: true } });
    return result._avg.price;
  }

  public async ordersByStatus(): Promise<OrderStatusCount[]> {
    const rows = await this.prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
      orderBy: { status: 'asc' },
    });
    return rows.map((r) => ({ status: r.status, count: r._count.id }));
  }

  public async ordersPerUser(limit: number = 10): Promise<OrdersPerUser[]> {
    const rows = await this.prisma.order.groupBy({
      by: ['userId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });
    return rows.map((r) => ({ userId: r.userId, count: r._count.id }));
  }

  public async topProducts(limit: number = 10): Promise<TopProductRow[]> {
    const rows = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    });
    return rows.map((r) => ({
      productId: r.productId,
      totalQuantity: r._sum.quantity ?? 0,
    }));
  }

  /**
   * Revenue per (category, year-month) for paid orders, with active-promotion
   * discounts applied per order item.
   *
   * Why raw SQL? Prisma's typed `groupBy` cannot easily express:
   *   - JOINs across 5+ tables,
   *   - a CASE/COALESCE expression that depends on a JOINed Promotion row,
   *   - grouping by a derived column (substr of createdAt to get YYYY-MM).
   *
   * SQL-INJECTION PREVENTION (Prisma example):
   *
   *   Safe (this method):
   *     prisma.$queryRaw(Prisma.sql`... WHERE col >= ${value}`)
   *   The `${value}` is bound as a parameter via the underlying driver, not
   *   concatenated into the SQL string. Even if `value` were
   *   "2026-01-01' OR 1=1 --", the engine would compare `col` against that
   *   entire literal string - it cannot break out of the value position.
   *
   *   Unsafe (do NOT do this):
   *     prisma.$queryRawUnsafe(`... WHERE col >= '${value}'`)
   *   Here the raw string is sent verbatim. A crafted `value` could close the
   *   quote and append arbitrary SQL (the textbook SQL-injection vector).
   *
   *   Rule of thumb: prefer Prisma.sql + $queryRaw. Only reach for
   *   $queryRawUnsafe when the dynamic part is *SQL itself* (e.g. an
   *   ORDER BY column name) and validate against an allow-list before use.
   */
  public async revenueByCategoryMonth(params: {
    since: string;
    until: string;
  }): Promise<RevenueByCategoryMonthRow[]> {
    type RawRow = {
      categoryCode: string;
      yearMonth: string;
      revenue: number;
      totalQty: number | bigint;
      orders: number | bigint;
    };

    const rows = await this.prisma.$queryRaw<RawRow[]>(Prisma.sql`
      WITH effective_discount AS (
        SELECT
          pp."productId" AS productId,
          o.id           AS orderId,
          MAX(COALESCE(pp."discountPctOverride", p."discountPct")) AS pct
        FROM "PromotionProduct" pp
        JOIN "Promotion" p ON p.id = pp."promotionId"
        JOIN "Order" o     ON o."createdAt" BETWEEN p."validFrom" AND p."validTo"
        WHERE p."isActive" = 1
        GROUP BY pp."productId", o.id
      )
      SELECT
        pc.code                                    AS categoryCode,
        substr(o."createdAt", 1, 7)                AS yearMonth,
        ROUND(
          SUM(oi."priceAtPurchase" * oi.quantity * (1 - COALESCE(ed.pct, 0) / 100.0)),
          2
        )                                          AS revenue,
        CAST(SUM(oi.quantity)        AS INTEGER)   AS totalQty,
        CAST(COUNT(DISTINCT o.id)    AS INTEGER)   AS orders
      FROM "Order" o
      JOIN "OrderItem"       oi ON oi."orderId"   = o.id
      JOIN "ProductCategory" pc ON pc."productId" = oi."productId"
      LEFT JOIN effective_discount ed
        ON ed.productId = oi."productId"
       AND ed.orderId   = o.id
      WHERE o.status = 'paid'
        AND o."createdAt" >= ${params.since}
        AND o."createdAt" <  ${params.until}
      GROUP BY pc.code, substr(o."createdAt", 1, 7)
      ORDER BY yearMonth DESC, revenue DESC
    `);

    return rows.map((r) => ({
      categoryCode: r.categoryCode,
      yearMonth: r.yearMonth,
      revenue: Number(r.revenue),
      totalQty: Number(r.totalQty),
      orders: Number(r.orders),
    }));
  }
}
