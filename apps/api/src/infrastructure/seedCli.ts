import 'dotenv/config';
import { prisma } from './prisma.js';
import { PrismaProductRepository } from '../modules/product/Repository/index.js';
import { seedDemoUsers, seedMockData } from './seed.js';

async function main(): Promise<void> {
  const repo = new PrismaProductRepository(prisma);
  await seedMockData(repo);
  await seedDemoUsers(prisma);
  console.info('[seed-cli] finished');
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('[seed-cli] failed', err);
  await prisma.$disconnect();
  process.exitCode = 1;
});
