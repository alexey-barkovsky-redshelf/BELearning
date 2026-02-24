import { Router } from 'express';
import { UserProductAccessController } from '../controllers/UserProductAccessController.js';

export function createAccessRoutes(controller: UserProductAccessController): Router {
  const router = Router();
  router.get('/user/:userId', (req, res) => {
    controller.listByUserId(req, res);
  });
  router.get('/user/:userId/product/:productId', (req, res) => {
    controller.checkAccess(req, res);
  });
  return router;
}
