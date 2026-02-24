/**
 * Маппинг категорий на фоновые картинки карточек.
 * Добавляй сюда только те категории, для которых есть подходящая картинка.
 * Остальные и "all" получают нейтральную картинку по умолчанию.
 *
 * Чтобы обновить: положи файл в public/categories/ и укажи имя здесь.
 */
const CATEGORIES_BASE = '/categories';

/** Нейтральная картинка, если для категории нет маппинга */
export const DEFAULT_CATEGORY_IMAGE = `${CATEGORIES_BASE}/category-default.png`;

/**
 * Код категории → имя файла (без пути).
 * Меняй этот объект при добавлении/замене картинок.
 */
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

/**
 * Возвращает URL картинки для категории.
 * Для "all" и неизвестных кодов возвращается дефолтная картинка.
 */
export function getCategoryImageUrl(categoryCode: string): string {
  const filename = CATEGORY_IMAGE_MAP[categoryCode];
  if (filename) {
    return `${CATEGORIES_BASE}/${filename}`;
  }
  return DEFAULT_CATEGORY_IMAGE;
}
