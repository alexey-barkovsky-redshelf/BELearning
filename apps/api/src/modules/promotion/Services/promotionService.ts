import type { Promotion as IPromotion } from '@belearning/shared';
import { BaseEntityService } from '../../../shared/services/index.js';
import { Promotion } from '../Models/index.js';
import type { IPromotionRepository } from '../Types/index.js';

export class PromotionService extends BaseEntityService<Promotion, IPromotion, IPromotionRepository> {
  public constructor(repository: IPromotionRepository) {
    super(repository);
  }

  public async findAll(): Promise<IPromotion[]> {
    return this.toPlains(await this.repository.findAll());
  }

  public async findActiveAt(at: Date = new Date()): Promise<IPromotion[]> {
    return this.toPlains(await this.repository.findActiveAt(at));
  }

  public async findByProductId(productId: string): Promise<IPromotion[]> {
    return this.toPlains(await this.repository.findByProductId(productId));
  }
}
