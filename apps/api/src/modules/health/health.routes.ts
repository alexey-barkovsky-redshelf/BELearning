import { Router } from 'express';
import { HealthController } from './health.controller.js';

export function createHealthRoutes(): Router {
  const router = Router();
  const controller = new HealthController();
  router.get('/', (req, res) => {
    controller.get(req, res);
  });
  return router;
}
