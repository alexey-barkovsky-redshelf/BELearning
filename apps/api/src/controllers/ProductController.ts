import type { Request, Response } from 'express';
import { DomainError } from '../domain/errors.js';
import { ProductService } from '../services/ProductService.js';

export class ProductController {
  constructor(private readonly productService: ProductService) {}

  async list(req: Request, res: Response): Promise<void> {
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const list = await this.productService.list(category);
    res.json(list);
  }

  async getById(req: Request, res: Response): Promise<void> {
    const product = await this.productService.getById(req.params.id);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(product);
  }

  async getBySlug(req: Request, res: Response): Promise<void> {
    const product = await this.productService.getBySlug(req.params.slug);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(product);
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const product = await this.productService.create(req.body);
      res.status(201).json(product);
    } catch (err) {
      if (err instanceof DomainError) {
        res.status(400).json({ error: err.message, code: err.code });
        return;
      }
      throw err;
    }
  }
}
