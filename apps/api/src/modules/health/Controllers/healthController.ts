import type { Request, Response } from 'express';
import { BaseController } from '../../../shared/controllers/index.js';
import { HealthService } from '../Services/index.js';

export class HealthController extends BaseController {
  private readonly healthService: HealthService = new HealthService();

  public get(_req: Request, res: Response): void {
    const status = this.healthService.getStatus();
    res.json(status);
  }
}
