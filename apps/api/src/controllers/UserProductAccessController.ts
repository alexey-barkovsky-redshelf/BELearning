import type { Request, Response } from 'express';
import { UserProductAccessService } from '../services/UserProductAccessService.js';

export class UserProductAccessController {
  constructor(private readonly service: UserProductAccessService) {}

  async listByUserId(req: Request, res: Response): Promise<void> {
    const list = await this.service.findByUserId(req.params.userId);
    res.json(list);
  }

  async checkAccess(req: Request, res: Response): Promise<void> {
    const { userId, productId } = req.params;
    const hasAccess = await this.service.hasAccess(userId, productId);
    res.json({ userId, productId, hasAccess });
  }
}
