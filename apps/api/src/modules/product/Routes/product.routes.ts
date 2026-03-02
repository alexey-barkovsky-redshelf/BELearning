import { Router } from 'express';
import { ProductController } from '../Controllers/index.js';

export function createProductRoutes(controller: ProductController): Router {
  const router = Router();
  router.get('/', controller.list.bind(controller));
  router.get('/slug/:slug', controller.getBySlug.bind(controller));
  router.get('/:id', controller.getById.bind(controller));
  router.post('/', (req, res, next) => controller.create(req, res).catch(next));
  return router;
}
