import { PRODUCT_CATEGORY_CODES } from '@belearning/shared';

export type CategoryDto = { code: string };

export class CategoryService {
  async list(): Promise<CategoryDto[]> {
    return PRODUCT_CATEGORY_CODES.map((code) => ({ code }));
  }
}
