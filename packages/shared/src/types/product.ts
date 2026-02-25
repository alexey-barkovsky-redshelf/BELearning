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

export type ProductCategoryCode = (typeof PRODUCT_CATEGORY)[keyof typeof PRODUCT_CATEGORY];

export const PRODUCT_CATEGORY_CODES: readonly ProductCategoryCode[] = Object.values(PRODUCT_CATEGORY);

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  currency: string;
  categories?: ProductCategoryCode[];
  manufacturer?: string;
  createdAt: string;
  updatedAt: string;
}
