import type { UserProductAccess as IUserProductAccess } from '@belearning/shared';
import type { IUserProductAccessRepository } from '../repositories/interfaces/IUserProductAccessRepository.js';

export class UserProductAccessService {
  constructor(private readonly repository: IUserProductAccessRepository) {}

  async findByUserId(userId: string): Promise<IUserProductAccess[]> {
    const list = await this.repository.findByUserId(userId);
    return list.filter((a) => a.isValid()).map((a) => a.toJSON());
  }

  async hasAccess(userId: string, productId: string): Promise<boolean> {
    const access = await this.repository.findByUserAndProduct(userId, productId);
    return access != null && access.isValid();
  }
}
