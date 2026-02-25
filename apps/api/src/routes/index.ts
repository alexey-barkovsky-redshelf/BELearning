import { Router } from 'express';
import { InMemoryProductRepository } from '../repositories/InMemoryProductRepository.js';
import { InMemoryOrderRepository } from '../repositories/InMemoryOrderRepository.js';
import { ProductService } from '../services/ProductService.js';
import { CategoryService } from '../services/CategoryService.js';
import { OrderService } from '../services/OrderService.js';
import { ProductController } from '../controllers/ProductController.js';
import { CategoryController } from '../controllers/CategoryController.js';
import { OrderController } from '../controllers/OrderController.js';
import { seedMockData } from '../seed/mockData.js';
import { createHealthRoutes } from './healthRoutes.js';
import { createProductRoutes } from './productRoutes.js';
import { createCategoryRoutes } from './categoryRoutes.js';
import { createOrderRoutes } from './orderRoutes.js';

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
