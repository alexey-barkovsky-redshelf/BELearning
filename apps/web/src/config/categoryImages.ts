const CATEGORIES_BASE = '/categories';

export const DEFAULT_CATEGORY_IMAGE = `${CATEGORIES_BASE}/category-default.png`;

export const CATEGORY_IMAGE_MAP: Record<string, string> = {
  health: 'category-health.png',
  sport: 'category-sport.png',
  hobby: 'category-hobby.png',
  promotions: 'category-promotions.png',
  for_men: 'category-for_men.png',
  for_women: 'category-for_women.png',
  for_children: 'category-for_children.png',
  food: 'category-food.png',
  books: 'category-books.png',
};

export function getCategoryImageUrl(categoryCode: string): string {
  const filename = CATEGORY_IMAGE_MAP[categoryCode];
  return filename ? `${CATEGORIES_BASE}/${filename}` : DEFAULT_CATEGORY_IMAGE;
}
