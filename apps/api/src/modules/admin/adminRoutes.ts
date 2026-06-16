import { Router } from 'express';
import { asyncHandler, requireAdmin } from '../../shared/middleware/index.js';
import { AdminController } from './AdminController.js';

export function createAdminRoutes(controller: AdminController): Router {
  const router = Router();

  router.get('/users', requireAdmin, asyncHandler((req, res) => controller.listUsers(req, res)));

  router.get('/orders', requireAdmin, asyncHandler((req, res) => controller.listOrders(req, res)));

  return router;
}
