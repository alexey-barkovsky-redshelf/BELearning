import { Router } from 'express';
import { OrderController } from '../controllers/OrderController.js';

export function createOrderRoutes(controller: OrderController): Router {
  const router = Router();
  router.post('/', (req, res) => {
    controller.create(req, res);
  });
  router.get('/user/:userId', (req, res) => {
    controller.getByUserId(req, res);
  });
  router.post('/:id/paid', (req, res) => {
    controller.markPaid(req, res);
  });
  router.get('/:id', (req, res) => {
    controller.getById(req, res);
  });
  return router;
}
