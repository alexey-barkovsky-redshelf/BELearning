import { idParamSchema } from '@belearning/shared';
import { Router } from 'express';
import { asyncHandler, validateParams } from '../../../shared/middleware/index.js';
import { PromotionController } from '../Controllers/index.js';

export function createPromotionRoutes(controller: PromotionController): Router {
  const router = Router();

  router.get('/', asyncHandler((req, res) => controller.list(req, res)));
  router.get('/active', asyncHandler((req, res) => controller.listActive(req, res)));
  router.get(
    '/:id',
    validateParams(idParamSchema),
    asyncHandler((req, res) => controller.getById(req, res)),
  );

  return router;
}
