import type { OrderItem as IOrderItem, Order as IOrder, OrderStatus as IOrderStatus } from '@belearning/shared';
import { InvalidOrderError } from './order.errors.js';

export class OrderItem {
  private constructor(
    public readonly productId: string,
    public readonly productTitle: string,
    public readonly priceAtPurchase: number,
    public readonly quantity: number
  ) {}

  static create(
    productId: string,
    productTitle: string,
    priceAtPurchase: number,
    quantity: number
  ): OrderItem {
    if (!productId?.trim()) {
      throw new InvalidOrderError('Order item productId is required.');
    }
    if (!productTitle?.trim()) {
      throw new InvalidOrderError('Order item productTitle is required.');
    }
    if (typeof priceAtPurchase !== 'number' || priceAtPurchase < 0 || !Number.isFinite(priceAtPurchase)) {
      throw new InvalidOrderError('Order item price must be a non-negative number.');
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new InvalidOrderError('Order item quantity must be a positive integer.');
    }
    return new OrderItem(productId, productTitle.trim(), priceAtPurchase, quantity);
  }

  getLineTotal(): number {
    return Math.round(this.priceAtPurchase * this.quantity * 100) / 100;
  }

  toJSON(): IOrderItem {
    return {
      productId: this.productId,
      productTitle: this.productTitle,
      priceAtPurchase: this.priceAtPurchase,
      quantity: this.quantity,
    };
  }
}

export class Order {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    private _status: IOrderStatus,
    private readonly _items: OrderItem[],
    private readonly _currency: string,
    public readonly createdAt: string,
    public readonly updatedAt: string
  ) {}

  get status(): IOrderStatus {
    return this._status;
  }

  get items(): ReadonlyArray<OrderItem> {
    return this._items;
  }

  get totalAmount(): number {
    return this._items.reduce((sum, item) => sum + item.getLineTotal(), 0);
  }

  get currency(): string {
    return this._currency;
  }

  static create(params: {
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

  static fromPlain(data: IOrder): Order {
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

  toJSON(): IOrder {
    return {
      id: this.id,
      userId: this.userId,
      status: this._status,
      totalAmount: this.totalAmount,
      currency: this._currency,
      items: this._items.map((i) => i.toJSON()),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private setStatus(s: IOrderStatus): void {
    (this as unknown as { _status: IOrderStatus })._status = s;
  }

  markPaid(): void {
    if (this._status === 'paid') {
      throw new InvalidOrderError('Order is already paid.');
    }
    if (this._status === 'cancelled') {
      throw new InvalidOrderError('Cannot pay a cancelled order.');
    }
    this.setStatus('paid');
  }

  cancel(): void {
    if (this._status === 'paid') {
      throw new InvalidOrderError('Cannot cancel a paid order.');
    }
    this.setStatus('cancelled');
  }
}
