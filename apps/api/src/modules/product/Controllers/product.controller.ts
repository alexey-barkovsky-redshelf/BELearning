import type { Request, Response } from 'express';
import { ProductService } from '../Services/index.js';

export class ProductController {
  private readonly productService: ProductService;

  public constructor(productService: ProductService) {
    this.productService = productService;
  }

  public async list(req: Request, res: Response): Promise<void> {
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const list = await this.productService.list(category);
    res.json(list);
  }

  public async getById(req: Request, res: Response): Promise<void> {
    const product = await this.productService.getById(req.params.id);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(product);
  }

  public async getBySlug(req: Request, res: Response): Promise<void> {
    const product = await this.productService.getBySlug(req.params.slug);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(product);
  }

  public async create(req: Request, res: Response): Promise<void> {
    const product = await this.productService.create(req.body);
    res.status(201).json(product);
  }
}
