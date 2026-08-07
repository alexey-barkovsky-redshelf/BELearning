import type { Request, Response } from 'express';
import { BaseController } from '../../../shared/controllers/index.js';
import { AnalyticsService } from '../Services/index.js';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

function parseLimit(raw: unknown): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) {
    return DEFAULT_LIMIT;
  }
  return Math.min(Math.floor(n), MAX_LIMIT);
}

export class AnalyticsController extends BaseController {
  public constructor(private readonly service: AnalyticsService) {
    super();
  }

  public async ordersByStatus(_req: Request, res: Response): Promise<void> {
    res.json(await this.service.ordersByStatus());
  }

  public async ordersPerUser(req: Request, res: Response): Promise<void> {
    res.json(await this.service.ordersPerUser(parseLimit(req.query.limit)));
  }

  public async topProducts(req: Request, res: Response): Promise<void> {
    res.json(await this.service.topProducts(parseLimit(req.query.limit)));
  }

  public async averageProductPrice(_req: Request, res: Response): Promise<void> {
    res.json({ averagePrice: await this.service.averageProductPrice() });
  }

  public async activePromotionsCount(_req: Request, res: Response): Promise<void> {
    res.json({ count: await this.service.countActivePromotions() });
  }

  public async revenueByCategoryMonth(req: Request, res: Response): Promise<void> {
    const since = typeof req.query.since === 'string' ? req.query.since : '';
    const until = typeof req.query.until === 'string' ? req.query.until : '';
    if (!since || !until) {
      res.status(400).json({
        error: '`since` and `until` ISO date strings are required (e.g. 2026-01-01)',
      });
      return;
    }
    res.json(await this.service.revenueByCategoryMonth({ since, until }));
  }
}
