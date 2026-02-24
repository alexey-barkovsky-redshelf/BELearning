import type { OrderItem as IOrderItem } from '@belearning/shared';
import { InvalidOrderError } from './errors.js';

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
