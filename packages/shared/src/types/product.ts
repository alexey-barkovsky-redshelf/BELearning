export type ProductCategoryCode =
  | 'health'
  | 'sport'
  | 'hobby'
  | 'promotions'
  | 'for_men'
  | 'for_women'
  | 'for_children'
  | 'food'
  | 'books';

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
