import { z } from 'zod';
import { nonEmptyString } from './common';

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

const categoryQueryValue = z.preprocess(
  (v) => {
    if (Array.isArray(v)) {
      return v[0];
    }
    return v;
  },
  z.string().optional(),
);

export const listProductsQuerySchema = z.object({
  category: categoryQueryValue,
});

export const productSlugParamSchema = z.object({
  slug: nonEmptyString,
});

export const productIdParamSchema = z.object({
  id: nonEmptyString,
});
