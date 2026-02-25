import { Router } from 'express';
import { OrderController } from '../controllers/OrderController.js';

export function createOrderRoutes(controller: OrderController): Router {
  const router = Router();
  router.post('/', (req, res, next) => controller.create(req, res).catch(next));
  router.get('/user/:userId', controller.getByUserId.bind(controller));
  router.post('/:id/paid', (req, res, next) => controller.markPaid(req, res).catch(next));
  router.get('/:id', controller.getById.bind(controller));
  return router;
}
