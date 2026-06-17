import type { PromotionProduct as IPromotionProduct } from '@belearning/shared';
import { InvalidPromotionError } from '../Errors/index.js';

export class PromotionProduct {
  public readonly productId: string;
  public readonly discountPctOverride: number | null;

  private constructor(productId: string, discountPctOverride: number | null) {
    this.productId = productId;
    this.discountPctOverride = discountPctOverride;
  }

  public static create(productId: string, discountPctOverride?: number | null): PromotionProduct {
    if (!productId.trim()) {
      throw new InvalidPromotionError('PromotionProduct productId is required.');
    }
    if (discountPctOverride !== undefined && discountPctOverride !== null) {
      if (!Number.isFinite(discountPctOverride) || discountPctOverride < 0 || discountPctOverride > 100) {
        throw new InvalidPromotionError('discountPctOverride must be between 0 and 100.');
      }
    }
    return new PromotionProduct(productId, discountPctOverride ?? null);
  }

  public toJSON(): IPromotionProduct {
    return {
      productId: this.productId,
      discountPctOverride: this.discountPctOverride,
    };
  }
}
