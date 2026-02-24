/** Category codes for products (API and filters) */
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
  /** Product categories (e.g. health, sport, for_men, promotions) */
  categories?: ProductCategoryCode[];
  /** Manufacturer / brand (for filtering and display) */
  manufacturer?: string;
  createdAt: string;
  updatedAt: string;
}
