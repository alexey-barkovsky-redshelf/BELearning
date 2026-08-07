import type { Promotion as IPromotion, PromotionProduct as IPromotionProduct } from '@belearning/shared';
import { BaseEntity } from '../../../shared/entities/index.js';
import { InvalidPromotionError } from '../Errors/index.js';
import { PromotionProduct } from './promotionProduct.js';

export class Promotion extends BaseEntity {
  public readonly name: string;
  public readonly description: string | null;
  public readonly discountPct: number;
  public readonly validFrom: string;
  public readonly validTo: string;
  public readonly isActive: boolean;
  private readonly _products: PromotionProduct[];

  private constructor(
    id: string,
    name: string,
    description: string | null,
    discountPct: number,
    validFrom: string,
    validTo: string,
    isActive: boolean,
    products: PromotionProduct[],
    createdAt: string,
    updatedAt: string,
  ) {
    super(id, createdAt, updatedAt);
    this.name = name;
    this.description = description;
    this.discountPct = discountPct;
    this.validFrom = validFrom;
    this.validTo = validTo;
    this.isActive = isActive;
    this._products = products;
  }

  public get products(): ReadonlyArray<PromotionProduct> {
    return this._products;
  }

  public static create(params: {
    id: string;
    name: string;
    description?: string | null;
    discountPct: number;
    validFrom: string;
    validTo: string;
    isActive?: boolean;
    products?: Array<{ productId: string; discountPctOverride?: number | null }>;
    createdAt: string;
    updatedAt: string;
  }): Promotion {
    if (!params.name.trim()) {
      throw new InvalidPromotionError('Promotion name is required.');
    }
    if (!Number.isFinite(params.discountPct) || params.discountPct < 0 || params.discountPct > 100) {
      throw new InvalidPromotionError('discountPct must be between 0 and 100.');
    }
    if (Date.parse(params.validFrom) > Date.parse(params.validTo)) {
      throw new InvalidPromotionError('validFrom must be <= validTo.');
    }

    const products = (params.products ?? []).map((p) =>
      PromotionProduct.create(p.productId, p.discountPctOverride),
    );

    return new Promotion(
      params.id,
      params.name,
      params.description ?? null,
      params.discountPct,
      params.validFrom,
      params.validTo,
      params.isActive ?? true,
      products,
      params.createdAt,
      params.updatedAt,
    );
  }

  public static fromPlain(data: IPromotion): Promotion {
    return Promotion.create({
      id: data.id,
      name: data.name,
      description: data.description ?? null,
      discountPct: data.discountPct,
      validFrom: data.validFrom,
      validTo: data.validTo,
      isActive: data.isActive,
      products: data.products.map((p: IPromotionProduct) => ({
        productId: p.productId,
        discountPctOverride: p.discountPctOverride ?? null,
      })),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  public isActiveAt(at: Date = new Date()): boolean {
    if (!this.isActive) {
      return false;
    }
    const t = at.getTime();
    return Date.parse(this.validFrom) <= t && t <= Date.parse(this.validTo);
  }

  public toJSON(): IPromotion {
    return {
      ...this.toJSONBase(),
      name: this.name,
      description: this.description,
      discountPct: this.discountPct,
      validFrom: this.validFrom,
      validTo: this.validTo,
      isActive: this.isActive,
      products: this._products.map((p) => p.toJSON()),
    };
  }
}
