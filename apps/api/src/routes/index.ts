import { Router } from 'express';
import { prisma } from '../infrastructure/prisma.js';
import { PrismaProductRepository } from '../modules/product/Repository/index.js';
import { PrismaCategoryRepository } from '../modules/category/Repository/index.js';
import { PrismaPromotionRepository } from '../modules/promotion/Repository/index.js';
import { PrismaOrderRepository } from '../modules/order/Repository/index.js';
import { ProductService } from '../modules/product/Services/index.js';
import { CategoryService } from '../modules/category/Services/index.js';
import { PromotionService } from '../modules/promotion/Services/index.js';
import { OrderService } from '../modules/order/Services/index.js';
import { ProductController } from '../modules/product/Controllers/index.js';
import { CategoryController } from '../modules/category/Controllers/index.js';
import { PromotionController } from '../modules/promotion/Controllers/index.js';
import { OrderController } from '../modules/order/Controllers/index.js';
import { AuthController } from '../auth/authController.js';
import { AuthService } from '../auth/authService.js';
import { createAuthRoutes } from '../auth/authRoutes.js';
import {
  seedCategories,
  seedDemoUsers,
  seedMockData,
  seedPromotions,
} from '../infrastructure/index.js';
import { createHealthRoutes } from '../modules/health/Routes/index.js';
import { createProductRoutes } from '../modules/product/Routes/index.js';
import { createCategoryRoutes } from '../modules/category/Routes/index.js';
import { createPromotionRoutes } from '../modules/promotion/Routes/index.js';
import { AdminController, createAdminRoutes } from '../modules/admin/index.js';
import { AnalyticsController } from '../modules/analytics/Controllers/index.js';
import { AnalyticsService } from '../modules/analytics/Services/index.js';
import { createAnalyticsRoutes } from '../modules/analytics/Routes/index.js';
import { createOrderRoutes } from '../modules/order/Routes/index.js';

export class AppRouter {
  public async getRouter(): Promise<Router> {
    const root = Router();

    const productRepository = new PrismaProductRepository(prisma);
    const categoryRepository = new PrismaCategoryRepository(prisma);
    const promotionRepository = new PrismaPromotionRepository(prisma);
    const orderRepository = new PrismaOrderRepository(prisma);

    const nodeEnv = process.env.NODE_ENV ?? 'development';
    const seedOnStartup = nodeEnv !== 'production' || process.env.SEED_MOCK_DATA === 'true';
    if (seedOnStartup) {
      await seedCategories(categoryRepository);
      await seedMockData(productRepository);
      await seedPromotions(promotionRepository, productRepository);
      await seedDemoUsers(prisma);
    } else {
      console.info(
        '[seed] skipped in production (set SEED_MOCK_DATA=true or run yarn workspace @belearning/api db:seed)',
      );
    }

    const productService = new ProductService(productRepository);
    const orderService = new OrderService(orderRepository);
    const promotionService = new PromotionService(promotionRepository);

    const categoryService = new CategoryService(categoryRepository);
    const productController = new ProductController(productService);
    const categoryController = new CategoryController(categoryService);
    const promotionController = new PromotionController(promotionService);
    const orderController = new OrderController(orderService);

    const authController = new AuthController(new AuthService(prisma));
    const adminController = new AdminController(prisma, orderService);
    const analyticsController = new AnalyticsController(new AnalyticsService(prisma));

    root.use('/health', createHealthRoutes());
    root.use('/auth', createAuthRoutes(authController));
    root.use('/admin', createAdminRoutes(adminController));
    root.use('/categories', createCategoryRoutes(categoryController));
    root.use('/products', createProductRoutes(productController));
    root.use('/promotions', createPromotionRoutes(promotionController));
    root.use('/orders', createOrderRoutes(orderController));
    root.use('/analytics', createAnalyticsRoutes(analyticsController));

    return root;
  }
}
