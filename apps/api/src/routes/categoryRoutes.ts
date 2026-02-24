import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController.js';

export function createCategoryRoutes(controller: CategoryController): Router {
  const router = Router();
  router.get('/', (req, res) => {
    controller.list(req, res);
  });
  return router;
}
