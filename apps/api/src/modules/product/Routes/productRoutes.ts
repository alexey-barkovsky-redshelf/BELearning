import { Router } from 'express';
import { asyncHandler } from '../../../shared/middleware/index.js';
import { ProductController } from '../Controllers/index.js';

export function createProductRoutes(controller: ProductController): Router {
  const router = Router();
  router.get('/', asyncHandler((req, res) => controller.list(req, res)));
  router.get('/slug/:slug', asyncHandler((req, res) => controller.getBySlug(req, res)));
  router.get('/:id', asyncHandler((req, res) => controller.getById(req, res)));
  router.post('/', asyncHandler((req, res) => controller.create(req, res)));
  return router;
}
