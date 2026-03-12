import type { Order as IOrder, OrderItem as IOrderItem, OrderStatus as IOrderStatus } from '@belearning/shared';
import { BaseEntity } from '../../../shared/entities/index.js';
import { InvalidOrderError } from '../Errors/index.js';
import { OrderItem } from './orderItem.js';

export class Order extends BaseEntity {
  public readonly userId: string;
  private _status: IOrderStatus;
  private readonly _items: OrderItem[];
  private readonly _currency: string;

  private constructor(
    id: string,
    userId: string,
    status: IOrderStatus,
    items: OrderItem[],
    currency: string,
    createdAt: string,
    updatedAt: string
  ) {
    super(id, createdAt, updatedAt);
    this.userId = userId;
    this._status = status;
    this._items = items;
    this._currency = currency;
  }

  public get status(): IOrderStatus {
    return this._status;
  }

  public get items(): ReadonlyArray<OrderItem> {
    return this._items;
  }

  public get totalAmount(): number {
    return this._items.reduce((sum, item) => sum + item.getLineTotal(), 0);
  }

  public get currency(): string {
    return this._currency;
  }

  public static create(params: {
    id: string;
    userId: string;
    items: Array<{ productId: string; productTitle: string; priceAtPurchase: number; quantity: number }>;
    currency?: string;
    createdAt: string;
    updatedAt: string;
  }): Order {
    if (!params.userId?.trim()) {
      throw new InvalidOrderError('Order userId is required.');
    }
    const currency = params.currency ?? 'USD';
    const items = params.items.map((i) =>
      OrderItem.create(i.productId, i.productTitle, i.priceAtPurchase, i.quantity)
    );
    if (items.length === 0) {
      throw new InvalidOrderError('Order must have at least one item.');
    }
    return new Order(params.id, params.userId, 'draft', items, currency, params.createdAt, params.updatedAt);
  }

  public static fromPlain(data: IOrder): Order {
    const items = data.items.map((i: IOrderItem) =>
      OrderItem.create(i.productId, i.productTitle, i.priceAtPurchase, i.quantity)
    );
    return new Order(
      data.id,
      data.userId,
      data.status,
      items,
      data.currency,
      data.createdAt,
      data.updatedAt
    );
  }

  public toJSON(): IOrder {
    return {
      ...this.toJSONBase(),
      userId: this.userId,
      status: this._status,
      totalAmount: this.totalAmount,
      currency: this._currency,
      items: this._items.map((i) => i.toJSON()),
    };
  }

  private setStatus(s: IOrderStatus): void {
    (this as unknown as { _status: IOrderStatus })._status = s;
  }

  public markPaid(): void {
    if (this._status === 'paid') {
      throw new InvalidOrderError('Order is already paid.');
    }
    if (this._status === 'cancelled') {
      throw new InvalidOrderError('Cannot pay a cancelled order.');
    }
    this.setStatus('paid');
  }

  public cancel(): void {
    if (this._status === 'paid') {
      throw new InvalidOrderError('Cannot cancel a paid order.');
    }
    this.setStatus('cancelled');
  }
}
