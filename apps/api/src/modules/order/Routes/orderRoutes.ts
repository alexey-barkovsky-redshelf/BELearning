import { Router } from 'express';
import { asyncHandler } from '../../../shared/middleware/index.js';
import { OrderController } from '../Controllers/index.js';

export function createOrderRoutes(controller: OrderController): Router {
  const router = Router();
  router.post('/', asyncHandler((req, res) => controller.create(req, res)));
  router.get('/user/:userId', asyncHandler((req, res) => controller.getByUserId(req, res)));
  router.post('/:id/paid', asyncHandler((req, res) => controller.markPaid(req, res)));
  router.get('/:id', asyncHandler((req, res) => controller.getById(req, res)));
  return router;
}
