import { Router } from 'express';
import { asyncHandler, requireAuth, requireRole } from '../../shared/middleware/index.js';
import { AdminController } from './AdminController.js';

export function createAdminRoutes(controller: AdminController): Router {
  const router = Router();
  router.use(requireAuth);
  router.use(requireRole('admin'));
  router.get('/users', asyncHandler((req, res) => controller.listUsers(req, res)));
  router.get('/orders', asyncHandler((req, res) => controller.listOrders(req, res)));
  return router;
}
