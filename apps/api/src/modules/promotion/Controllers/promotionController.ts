import type { Request, Response } from 'express';
import { BaseController } from '../../../shared/controllers/index.js';
import { PromotionService } from '../Services/index.js';

export class PromotionController extends BaseController {
  public constructor(private readonly promotionService: PromotionService) {
    super();
  }

  public async list(_req: Request, res: Response): Promise<void> {
    const items = await this.promotionService.findAll();
    res.json(items);
  }

  public async listActive(_req: Request, res: Response): Promise<void> {
    const items = await this.promotionService.findActiveAt();
    res.json(items);
  }

  public async getById(req: Request, res: Response): Promise<void> {
    const id = (req.validatedParams as { id: string }).id;
    const item = await this.promotionService.getById(id);
    if (!item) {
      res.status(404).json({ error: 'Promotion not found' });
      return;
    }
    res.json(item);
  }
}
