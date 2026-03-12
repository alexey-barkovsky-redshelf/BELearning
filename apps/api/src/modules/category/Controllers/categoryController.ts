import type { Request, Response } from 'express';
import { BaseController } from '../../../shared/controllers/index.js';
import { CategoryService } from '../Services/index.js';

export class CategoryController extends BaseController {
  public constructor(private readonly categoryService: CategoryService) {
    super();
  }

  public async list(_req: Request, res: Response): Promise<void> {
    const list = await this.categoryService.list();
    res.json(list);
  }
}
