import { PRODUCT_CATEGORY_CODES } from '@belearning/shared';
import type { CategoryDto } from '../Types/category.types.js';

export class CategoryService {
  async list(): Promise<CategoryDto[]> {
    return PRODUCT_CATEGORY_CODES.map((code) => ({ code }));
  }
}
