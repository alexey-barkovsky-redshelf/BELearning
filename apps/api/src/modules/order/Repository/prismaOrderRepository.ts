import type { PrismaClient } from '@prisma/client';
import { Order } from '../Models/index.js';
import type { IOrderRepository } from '../Types/index.js';

function rowToOrder(row: {
  id: string;
  userId: string;
  status: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    productId: string;
    productTitle: string;
    priceAtPurchase: number;
    quantity: number;
  }>;
}): Order {
  const items = row.items.map((i) => ({
    productId: i.productId,
    productTitle: i.productTitle,
    priceAtPurchase: i.priceAtPurchase,
    quantity: i.quantity,
  }));
  const totalAmount = items.reduce(
    (sum, i) => sum + i.priceAtPurchase * i.quantity,
    0
  );
  return Order.fromPlain({
    id: row.id,
    userId: row.userId,
    status: row.status as 'draft' | 'paid' | 'cancelled',
    currency: row.currency,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    items,
    totalAmount,
  });
}

export class PrismaOrderRepository implements IOrderRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async findById(id: string): Promise<Order | null> {
    const row = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    return row ? rowToOrder(row) : null;
  }

  public async findByUserId(userId: string): Promise<Order[]> {
    const rows = await this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
    });
    return rows.map((row) => rowToOrder(row));
  }

  public async save(order: Order): Promise<Order> {
    const plain = order.toJSON();
    const existing = await this.prisma.order.findUnique({
      where: { id: order.id },
      include: { items: true },
    });
    if (existing) {
      await this.prisma.$transaction(async (tx) => {
        await tx.orderItem.deleteMany({ where: { orderId: order.id } });
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: plain.status,
            updatedAt: plain.updatedAt,
          },
        });
        for (const item of plain.items) {
          await tx.orderItem.create({
            data: {
              orderId: order.id,
              productId: item.productId,
              productTitle: item.productTitle,
              priceAtPurchase: item.priceAtPurchase,
              quantity: item.quantity,
            },
          });
        }
      });
    } else {
      await this.prisma.order.create({
        data: {
          id: plain.id,
          userId: plain.userId,
          status: plain.status,
          currency: plain.currency,
          createdAt: plain.createdAt,
          updatedAt: plain.updatedAt,
          items: {
            create: plain.items.map((item: { productId: string; productTitle: string; priceAtPurchase: number; quantity: number }) => ({
              productId: item.productId,
              productTitle: item.productTitle,
              priceAtPurchase: item.priceAtPurchase,
              quantity: item.quantity,
            })),
          },
        },
      });
    }
    return order;
  }
}
