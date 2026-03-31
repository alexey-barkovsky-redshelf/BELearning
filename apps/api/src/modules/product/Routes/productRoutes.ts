import {
  createProductBodySchema,
  listProductsQuerySchema,
  productIdParamSchema,
  productSlugParamSchema,
} from '@belearning/shared';
import { Router } from 'express';
import { asyncHandler, validateBody, validateParams, validateQuery } from '../../../shared/middleware/index.js';
import { ProductController } from '../Controllers/index.js';

export function createProductRoutes(controller: ProductController): Router {
  const router = Router();
  router.get('/', validateQuery(listProductsQuerySchema), asyncHandler((req, res) => controller.list(req, res)));
  router.get(
    '/slug/:slug',
    validateParams(productSlugParamSchema),
    asyncHandler((req, res) => controller.getBySlug(req, res)),
  );
  router.get('/:id', validateParams(productIdParamSchema), asyncHandler((req, res) => controller.getById(req, res)));
  router.post('/', validateBody(createProductBodySchema), asyncHandler((req, res) => controller.create(req, res)));
  return router;
}
