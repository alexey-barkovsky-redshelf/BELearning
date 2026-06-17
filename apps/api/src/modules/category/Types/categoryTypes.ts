import type { Category } from '@belearning/shared';
import type { Category as CategoryEntity } from '../Models/category.js';

export type { Category };

export interface ICategoryRepository {
  findAll(): Promise<CategoryEntity[]>;
  findByCode(code: string): Promise<CategoryEntity | null>;
  findRoots(): Promise<CategoryEntity[]>;
  findChildrenOf(parentCode: string): Promise<CategoryEntity[]>;
  upsertMany(categories: CategoryEntity[]): Promise<void>;
}
