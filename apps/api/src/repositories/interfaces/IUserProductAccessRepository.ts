import type { UserProductAccess } from '../../domain/UserProductAccess.js';

export interface IUserProductAccessRepository {
  findByUserAndProduct(userId: string, productId: string): Promise<UserProductAccess | null>;
  findByUserId(userId: string): Promise<UserProductAccess[]>;
  save(access: UserProductAccess): Promise<UserProductAccess>;
}
