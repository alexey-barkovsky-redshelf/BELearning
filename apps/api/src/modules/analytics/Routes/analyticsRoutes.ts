import { Router } from 'express';
import { asyncHandler, requireAdmin } from '../../../shared/middleware/index.js';
import { AnalyticsController } from '../Controllers/index.js';

export function createAnalyticsRoutes(controller: AnalyticsController): Router {
  const router = Router();

  router.use(requireAdmin);

  router.get('/orders-by-status', asyncHandler((req, res) => controller.ordersByStatus(req, res)));
  router.get('/orders-per-user', asyncHandler((req, res) => controller.ordersPerUser(req, res)));
  router.get('/top-products', asyncHandler((req, res) => controller.topProducts(req, res)));
  router.get(
    '/average-product-price',
    asyncHandler((req, res) => controller.averageProductPrice(req, res)),
  );
  router.get(
    '/active-promotions-count',
    asyncHandler((req, res) => controller.activePromotionsCount(req, res)),
  );
  router.get(
    '/revenue-by-category-month',
    asyncHandler((req, res) => controller.revenueByCategoryMonth(req, res)),
  );

  return router;
}
