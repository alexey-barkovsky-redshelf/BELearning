import { Router } from 'express';
import { ProductController } from '../controllers/ProductController.js';

export function createProductRoutes(controller: ProductController): Router {
  const router = Router();
  router.get('/', (req, res) => {
    controller.list(req, res);
  });
  router.get('/slug/:slug', (req, res) => {
    controller.getBySlug(req, res);
  });
  router.get('/:id', (req, res) => {
    controller.getById(req, res);
  });
  router.post('/', (req, res) => {
    controller.create(req, res);
  });
  return router;
}
