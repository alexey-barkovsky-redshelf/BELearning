import { Router } from 'express';
import { prisma } from '../infrastructure/prisma.js';
import { PrismaProductRepository } from '../modules/product/Repository/index.js';
import { PrismaOrderRepository } from '../modules/order/Repository/index.js';
import { ProductService } from '../modules/product/Services/index.js';
import { CategoryService } from '../modules/category/Services/index.js';
import { OrderService } from '../modules/order/Services/index.js';
import { ProductController } from '../modules/product/Controllers/index.js';
import { CategoryController } from '../modules/category/Controllers/index.js';
import { OrderController } from '../modules/order/Controllers/index.js';
import { seedMockData } from '../infrastructure/index.js';
import { createHealthRoutes } from '../modules/health/Routes/index.js';
import { createProductRoutes } from '../modules/product/Routes/index.js';
import { createCategoryRoutes } from '../modules/category/Routes/index.js';
import { createOrderRoutes } from '../modules/order/Routes/index.js';

export class AppRouter {
  public async getRouter(): Promise<Router> {
    const root = Router();

    const productRepository = new PrismaProductRepository(prisma);
    const orderRepository = new PrismaOrderRepository(prisma);

    await seedMockData(productRepository);

    const productService = new ProductService(productRepository);
    const orderService = new OrderService(orderRepository);

    const categoryService = new CategoryService();
    const productController = new ProductController(productService);
    const categoryController = new CategoryController(categoryService);
    const orderController = new OrderController(orderService);

    root.use('/health', createHealthRoutes());
    root.use('/categories', createCategoryRoutes(categoryController));
    root.use('/products', createProductRoutes(productController));
    root.use('/orders', createOrderRoutes(orderController));

    return root;
  }
}
