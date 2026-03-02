import { PRODUCT_CATEGORY_CODES, type ProductCategoryCode } from '@belearning/shared';
import type { CategoryDto } from '../Types/category.types.js';

export class CategoryService {
  async list(): Promise<CategoryDto[]> {
    return PRODUCT_CATEGORY_CODES.map((code: ProductCategoryCode) => ({ code }));
  }
}
