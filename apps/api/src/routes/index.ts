import { Router } from 'express';
import { InMemoryProductRepository } from '../modules/product/Repository/product.repository.js';
import { InMemoryOrderRepository } from '../modules/order/Repository/order.repository.js';
import { ProductService } from '../modules/product/Services/product.service.js';
import { CategoryService } from '../modules/category/Services/category.service.js';
import { OrderService } from '../modules/order/Services/order.service.js';
import { ProductController } from '../modules/product/Controllers/product.controller.js';
import { CategoryController } from '../modules/category/Controllers/category.controller.js';
import { OrderController } from '../modules/order/Controllers/order.controller.js';
import { seedMockData } from '../infrastructure/seed.js';
import { createHealthRoutes } from '../modules/health/Routes/health.routes.js';
import { createProductRoutes } from '../modules/product/Routes/product.routes.js';
import { createCategoryRoutes } from '../modules/category/Routes/category.routes.js';
import { createOrderRoutes } from '../modules/order/Routes/order.routes.js';

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
