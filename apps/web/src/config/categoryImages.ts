/**
 * Category code → card background image.
 * Map is intentionally a subset of PRODUCT_CATEGORY_CODES (from @belearning/shared); categories
 * without an entry use DEFAULT_CATEGORY_IMAGE. Add new categories here when you add images.
 */
const CATEGORIES_BASE = '/categories';

/** Default image when category has no mapping */
export const DEFAULT_CATEGORY_IMAGE = `${CATEGORIES_BASE}/category-default.png`;

/** Category code → filename (no path). Subset of shared category codes. */
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

/** Returns image URL for category; "all" and unknown codes use default. */
export function getCategoryImageUrl(categoryCode: string): string {
  const filename = CATEGORY_IMAGE_MAP[categoryCode];
  return filename ? `${CATEGORIES_BASE}/${filename}` : DEFAULT_CATEGORY_IMAGE;
}
