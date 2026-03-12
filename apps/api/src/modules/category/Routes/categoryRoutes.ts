import { Router } from 'express';
import { asyncHandler } from '../../../shared/middleware/index.js';
import { CategoryController } from '../Controllers/index.js';

export function createCategoryRoutes(controller: CategoryController): Router {
  const router = Router();
  router.get('/', asyncHandler((req, res) => controller.list(req, res)));
  return router;
}
