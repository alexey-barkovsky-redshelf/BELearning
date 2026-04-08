import { loginBodySchema, registerBodySchema } from '@belearning/shared';
import { Router } from 'express';
import { asyncHandler, validateBody } from '../shared/middleware/index.js';
import { AuthController } from './authController.js';

export function createAuthRoutes(controller: AuthController): Router {
  const router = Router();
  router.post('/register', validateBody(registerBodySchema), asyncHandler((req, res) => controller.register(req, res)));
  router.post('/login', validateBody(loginBodySchema), asyncHandler((req, res) => controller.login(req, res)));
  return router;
}
