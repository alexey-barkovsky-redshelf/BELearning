import type { ProductCategoryCode } from '@belearning/shared';

export const APP_NAME = 'BELearning';

export const PRODUCT_CATEGORY = {
  HEALTH: 'health',
  SPORT: 'sport',
  HOBBY: 'hobby',
  PROMOTIONS: 'promotions',
  FOR_MEN: 'for_men',
  FOR_WOMEN: 'for_women',
  FOR_CHILDREN: 'for_children',
  FOOD: 'food',
  BOOKS: 'books',
} as const;

export const PRODUCT_CATEGORY_CODES: readonly ProductCategoryCode[] = Object.values(PRODUCT_CATEGORY);
