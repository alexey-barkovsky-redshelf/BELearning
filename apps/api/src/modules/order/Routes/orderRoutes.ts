import { createOrderBodySchema, orderIdParamSchema, orderUserIdParamSchema } from '@belearning/shared';
import { Router } from 'express';
import { asyncHandler, validateBody, validateParams } from '../../../shared/middleware/index.js';
import { OrderController } from '../Controllers/index.js';

export function createOrderRoutes(controller: OrderController): Router {
  const router = Router();
  router.post('/', validateBody(createOrderBodySchema), asyncHandler((req, res) => controller.create(req, res)));
  router.get(
    '/user/:userId',
    validateParams(orderUserIdParamSchema),
    asyncHandler((req, res) => controller.getByUserId(req, res)),
  );
  router.post('/:id/paid', validateParams(orderIdParamSchema), asyncHandler((req, res) => controller.markPaid(req, res)));
  router.get('/:id', validateParams(orderIdParamSchema), asyncHandler((req, res) => controller.getById(req, res)));
  return router;
}
