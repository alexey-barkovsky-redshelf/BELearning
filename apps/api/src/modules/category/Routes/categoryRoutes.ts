import { Router } from 'express';
import { asyncHandler } from '../../../shared/middleware/index.js';
import { CategoryController } from '../Controllers/index.js';

export function createCategoryRoutes(controller: CategoryController): Router {
  const router = Router();
  router.get('/', asyncHandler((req, res) => controller.list(req, res)));
  router.get('/tree', asyncHandler((req, res) => controller.tree(req, res)));
  return router;
}
