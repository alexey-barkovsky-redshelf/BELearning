import 'dotenv/config';
import { prisma } from './prisma.js';
import { PrismaCategoryRepository } from '../modules/category/Repository/index.js';
import { PrismaProductRepository } from '../modules/product/Repository/index.js';
import { PrismaPromotionRepository } from '../modules/promotion/Repository/index.js';
import { seedCategories, seedDemoUsers, seedMockData, seedPromotions } from './seed.js';

async function main(): Promise<void> {
  const productRepo = new PrismaProductRepository(prisma);
  const categoryRepo = new PrismaCategoryRepository(prisma);
  const promotionRepo = new PrismaPromotionRepository(prisma);
  await seedCategories(categoryRepo);
  await seedMockData(productRepo);
  await seedPromotions(promotionRepo, productRepo);
  await seedDemoUsers(prisma);
  console.info('[seed-cli] finished');
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('[seed-cli] failed', err);
  await prisma.$disconnect();
  process.exitCode = 1;
});
