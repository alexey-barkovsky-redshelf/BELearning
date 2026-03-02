import type { Request, Response } from 'express';
import { HealthService } from '../Services/health.service.js';

export class HealthController {
  private readonly healthService: HealthService = new HealthService();

  public get(_req: Request, res: Response): void {
    const status = this.healthService.getStatus();
    res.json(status);
  }
}
