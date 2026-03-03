import type { Request, Response } from 'express';
import { CategoryService } from '../Services/index.js';

export class CategoryController {
  private readonly categoryService: CategoryService;

  public constructor(categoryService: CategoryService) {
    this.categoryService = categoryService;
  }

  public async list(_req: Request, res: Response): Promise<void> {
    const list = await this.categoryService.list();
    res.json(list);
  }
}
