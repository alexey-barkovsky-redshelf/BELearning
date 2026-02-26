import type { Request, Response } from 'express';
import { CategoryService } from './category.service.js';

export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  async list(_req: Request, res: Response): Promise<void> {
    const list = await this.categoryService.list();
    res.json(list);
  }
}
