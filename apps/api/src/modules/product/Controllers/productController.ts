import type { Request, Response } from 'express';
import type { CreateProductBody, ListProductsQuery } from '@belearning/shared';
import { BaseController } from '../../../shared/controllers/index.js';
import { ProductService } from '../Services/index.js';

export class ProductController extends BaseController {
  public constructor(private readonly productService: ProductService) {
    super();
  }

  public async list(req: Request, res: Response): Promise<void> {
    const { category } = req.validatedQuery as ListProductsQuery;
    const list = await this.productService.list(category);
    res.json(list);
  }

  public async getById(req: Request, res: Response): Promise<void> {
    await this.getByIdAndSend(req, res, 'Product', (id) => this.productService.getById(id));
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
    const product = await this.productService.create(req.validatedBody as CreateProductBody);
    res.status(201).json(product);
  }
}
