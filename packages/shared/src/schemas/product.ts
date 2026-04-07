import { z } from 'zod';
import { isEmptyQueryInput, nonEmptyString } from './common';

export const LIST_PRODUCTS_SEARCH_MAX_LENGTH = 200;
export const LIST_PRODUCTS_CATEGORY_PARAM_MAX_LENGTH = 2048;

export const productCategoryCodeSchema = z.enum([
  'health',
  'sport',
  'hobby',
  'promotions',
  'for_men',
  'for_women',
  'for_children',
  'food',
  'books',
]);

export const createProductBodySchema = z.object({
  name: nonEmptyString,
  slug: nonEmptyString,
  price: z.number().finite().positive(),
  currency: nonEmptyString.optional(),
  description: z.string().optional(),
  categories: z.array(productCategoryCodeSchema).optional(),
  manufacturer: z.string().optional(),
});

export type CreateProductBody = z.infer<typeof createProductBodySchema>;

const categoryQueryValue = z.preprocess((v) => {
  if (isEmptyQueryInput(v)) {
    return undefined;
  }
  const raw = Array.isArray(v) ? v.map((item) => String(item)).join(',') : String(v);
  if (raw.length > LIST_PRODUCTS_CATEGORY_PARAM_MAX_LENGTH) {
    return ['__category_param_too_long__'];
  }
  const parts: string[] = [];
  if (Array.isArray(v)) {
    for (const item of v) {
      parts.push(...String(item).split(','));
    }
  } else {
    parts.push(...String(v).split(','));
  }
  const trimmed = parts.map((s) => s.trim()).filter(Boolean);
  const valid = trimmed.filter((p): p is z.infer<typeof productCategoryCodeSchema> =>
    productCategoryCodeSchema.safeParse(p).success,
  );
  return valid.length > 0 ? valid : undefined;
}, z.array(productCategoryCodeSchema).optional());

const searchQueryValue = z.preprocess(
  (v) => {
    if (isEmptyQueryInput(v)) {
      return undefined;
    }
    const raw = Array.isArray(v) ? v[0] : v;
    if (typeof raw !== 'string') {
      return undefined;
    }
    const t = raw.trim();
    return t.length > 0 ? t : undefined;
  },
  z.string().max(LIST_PRODUCTS_SEARCH_MAX_LENGTH).optional(),
);

const optionalNonNegativeNumber = z.preprocess(
  (v) => {
    if (isEmptyQueryInput(v)) {
      return undefined;
    }
    const raw = Array.isArray(v) ? v[0] : v;
    const n = Number.parseFloat(String(raw));
    return Number.isFinite(n) && n >= 0 ? n : undefined;
  },
  z.number().finite().nonnegative().optional(),
);

const pageQueryValue = z.preprocess(
  (v) => {
    if (isEmptyQueryInput(v)) {
      return 1;
    }
    const raw = Array.isArray(v) ? v[0] : v;
    const n = Number.parseInt(String(raw), 10);
    if (!Number.isFinite(n) || n < 1) {
      return 1;
    }
    return n;
  },
  z.number().int().min(1),
);

export const LIST_PRODUCTS_PAGE_SIZES = [5, 10, 25, 50, 100] as const;
export type ListProductsPageSize = (typeof LIST_PRODUCTS_PAGE_SIZES)[number];

export const DEFAULT_LIST_PRODUCTS_PAGE_SIZE: ListProductsPageSize = 25;

const allowedPageSizeSet = new Set<number>(LIST_PRODUCTS_PAGE_SIZES);

const pageSizeQueryValue = z.preprocess((v) => {
  if (isEmptyQueryInput(v)) {
    return DEFAULT_LIST_PRODUCTS_PAGE_SIZE;
  }
  const raw = Array.isArray(v) ? v[0] : v;
  const n = Number.parseInt(String(raw), 10);
  if (!Number.isFinite(n) || !allowedPageSizeSet.has(n)) {
    return DEFAULT_LIST_PRODUCTS_PAGE_SIZE;
  }
  return n;
}, z.union([z.literal(5), z.literal(10), z.literal(25), z.literal(50), z.literal(100)]));

const sortByQueryValue = z.preprocess(
  (v) => {
    if (isEmptyQueryInput(v)) {
      return 'name';
    }
    const raw = Array.isArray(v) ? v[0] : v;
    return typeof raw === 'string' ? raw : 'name';
  },
  z.enum(['name', 'price', 'createdAt']),
);

const orderQueryValue = z.preprocess(
  (v) => {
    if (isEmptyQueryInput(v)) {
      return 'asc';
    }
    const raw = Array.isArray(v) ? v[0] : v;
    return typeof raw === 'string' ? raw : 'asc';
  },
  z.enum(['asc', 'desc']),
);

export const listProductsQuerySchema = z
  .object({
    category: categoryQueryValue,
    search: searchQueryValue,
    minPrice: optionalNonNegativeNumber,
    maxPrice: optionalNonNegativeNumber,
    page: pageQueryValue,
    pageSize: pageSizeQueryValue,
    sortBy: sortByQueryValue,
    order: orderQueryValue,
  })
  .refine(
    (q) =>
      q.minPrice === undefined || q.maxPrice === undefined || q.maxPrice >= q.minPrice,
    { path: ['maxPrice'], message: 'maxPrice must be greater than or equal to minPrice' },
  );

export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;

export const productSlugParamSchema = z.object({
  slug: nonEmptyString,
});

export const productIdParamSchema = z.object({
  id: nonEmptyString,
});
