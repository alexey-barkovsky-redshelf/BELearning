import { Router } from 'express';
import { InMemoryProductRepository } from '../modules/product/product.repository.js';
import { InMemoryOrderRepository } from '../modules/order/order.repository.js';
import { ProductService } from '../modules/product/product.service.js';
import { CategoryService } from '../modules/category/category.service.js';
import { OrderService } from '../modules/order/order.service.js';
import { ProductController } from '../modules/product/product.controller.js';
import { CategoryController } from '../modules/category/category.controller.js';
import { OrderController } from '../modules/order/order.controller.js';
import { seedMockData } from '../infrastructure/seed.js';
import { createHealthRoutes } from '../modules/health/health.routes.js';
import { createProductRoutes } from '../modules/product/product.routes.js';
import { createCategoryRoutes } from '../modules/category/category.routes.js';
import { createOrderRoutes } from '../modules/order/order.routes.js';

export async function registerRoutes(): Promise<ReturnType<typeof Router>> {
  const root = Router();

  const productRepository = new InMemoryProductRepository();
  const orderRepository = new InMemoryOrderRepository();

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
