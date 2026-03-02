import type { ProductCategoryCode } from '@belearning/shared';
import { PRODUCT_CATEGORY_CODES } from '@belearning/utils';
import type { Category } from '../Types/category.types.js';

export class CategoryService {
  public async list(): Promise<Category[]> {
    return PRODUCT_CATEGORY_CODES.map((code: ProductCategoryCode) => ({ code }));
  }
}
