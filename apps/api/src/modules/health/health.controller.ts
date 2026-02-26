import type { Request, Response } from 'express';
import { HealthService } from './health.service.js';

export class HealthController {
  private readonly healthService = new HealthService();

  get(_req: Request, res: Response): void {
    const status = this.healthService.getStatus();
    res.json(status);
  }
}
