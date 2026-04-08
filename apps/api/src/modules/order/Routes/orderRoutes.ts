import { createOrderBodySchema, orderIdParamSchema, orderUserIdParamSchema } from '@belearning/shared';
import { Router } from 'express';
import {
  asyncHandler,
  requireAuth,
  requireRole,
  validateBody,
  validateParams,
} from '../../../shared/middleware/index.js';
import { OrderController } from '../Controllers/index.js';

export function createOrderRoutes(controller: OrderController): Router {
  const router = Router();
  router.post(
    '/',
    requireAuth,
    validateBody(createOrderBodySchema),
    asyncHandler((req, res) => controller.create(req, res)),
  );
  router.get('/me', requireAuth, asyncHandler((req, res) => controller.listMine(req, res)));
  router.get(
    '/user/:userId',
    requireAuth,
    requireRole('admin'),
    validateParams(orderUserIdParamSchema),
    asyncHandler((req, res) => controller.getByUserId(req, res)),
  );
  router.post(
    '/:id/paid',
    requireAuth,
    requireRole('admin'),
    validateParams(orderIdParamSchema),
    asyncHandler((req, res) => controller.markPaid(req, res)),
  );
  router.get(
    '/:id',
    requireAuth,
    validateParams(orderIdParamSchema),
    asyncHandler((req, res) => controller.getById(req, res)),
  );
  return router;
}
