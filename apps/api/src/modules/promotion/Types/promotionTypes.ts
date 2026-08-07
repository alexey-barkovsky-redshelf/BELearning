import type { Promotion as IPromotion, PromotionProduct as IPromotionProduct } from '@belearning/shared';
import type { Promotion as PromotionEntity } from '../Models/promotion.js';

export type { IPromotion, IPromotionProduct };

export interface IPromotionRepository {
  findAll(): Promise<PromotionEntity[]>;
  findById(id: string): Promise<PromotionEntity | null>;
  findActiveAt(at: Date): Promise<PromotionEntity[]>;
  findByProductId(productId: string): Promise<PromotionEntity[]>;
  save(entity: PromotionEntity): Promise<PromotionEntity>;
}
