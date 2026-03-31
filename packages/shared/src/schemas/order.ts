import { z } from 'zod';
import { nonEmptyString } from './common';

export const orderItemInputSchema = z.object({
  productId: nonEmptyString,
  productTitle: nonEmptyString,
  priceAtPurchase: z.number().finite(),
  quantity: z.number().int().positive(),
});

export const createOrderBodySchema = z.object({
  userId: nonEmptyString,
  items: z.array(orderItemInputSchema).min(1),
  currency: nonEmptyString.optional(),
});

export type CreateOrderBody = z.infer<typeof createOrderBodySchema>;
export type OrderItemInput = z.infer<typeof orderItemInputSchema>;

export const orderIdParamSchema = z.object({
  id: nonEmptyString,
});

export const orderUserIdParamSchema = z.object({
  userId: nonEmptyString,
});
