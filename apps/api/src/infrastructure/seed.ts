import { PRODUCT_CATEGORY, PRODUCT_CATEGORY_CODES } from '@belearning/utils';
import type { PrismaClient } from '@prisma/client';
import type { ProductCategoryCode } from '@belearning/shared';
import bcrypt from 'bcryptjs';
import { Category } from '../modules/category/Models/index.js';
import type { ICategoryRepository } from '../modules/category/Types/index.js';
import { Product } from '../modules/product/Models/index.js';
import type { IProductRepository } from '../modules/product/Types/index.js';
import { Promotion } from '../modules/promotion/Models/index.js';
import type { IPromotionRepository } from '../modules/promotion/Types/index.js';

const BULK_PER_CATEGORY = 50;

const INSERT_CHUNK_DEFAULT = 80;

function insertChunkSize(): number {
  const raw = process.env.SEED_CHUNK_SIZE;
  if (raw === undefined || raw === '') {
    return INSERT_CHUNK_DEFAULT;
  }
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) {
    return INSERT_CHUNK_DEFAULT;
  }
  return Math.min(500, n);
}

export type SeedMockDataResult = {
  inserted: number;
};

function now(): string {
  return new Date().toISOString();
}

function categoryLabel(code: ProductCategoryCode): string {
  return code
    .split('_')
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function categorySlugPrefix(code: ProductCategoryCode): string {
  return code.replaceAll('_', '-');
}

function buildBulkProducts(createdAt: string): Product[] {
  const brands = ['SeedCo', 'DemoMart', 'SampleWorks', 'MockGoods', 'TestSupply'];
  const out: Product[] = [];
  for (let c = 0; c < PRODUCT_CATEGORY_CODES.length; c++) {
    const code = PRODUCT_CATEGORY_CODES[c];
    const prefix = categorySlugPrefix(code);
    const label = categoryLabel(code);
    for (let i = 1; i <= BULK_PER_CATEGORY; i++) {
      const price = Math.min(199.99, Math.round((6.49 + i * 2.17 + c * 1.03) * 100) / 100);
      out.push(
        Product.create({
          id: `seed-${code}-${i}`,
          name: `${label} sample ${i}`,
          slug: `${prefix}-sample-${i}`,
          price,
          currency: 'USD',
          description: `Demo product for ${label} catalog (bulk ${i}).`,
          categories: [code],
          manufacturer: brands[(i + c) % brands.length],
          createdAt,
          updatedAt: createdAt,
        }),
      );
    }
  }
  return out;
}

export async function seedMockData(productRepository: IProductRepository): Promise<SeedMockDataResult> {
  const t = now();

  const baseProducts = [
    Product.create({
      id: 'mock-product-1',
      name: 'Intro Video',
      slug: 'intro-video',
      price: 9.99,
      currency: 'USD',
      description: 'Short intro video.',
      categories: [PRODUCT_CATEGORY.HOBBY, PRODUCT_CATEGORY.PROMOTIONS],
      manufacturer: 'MediaWorks',
      createdAt: t,
      updatedAt: t,
    }),
    Product.create({
      id: 'mock-product-2',
      name: 'Getting Started Guide',
      slug: 'getting-started',
      price: 4.99,
      currency: 'USD',
      categories: [PRODUCT_CATEGORY.BOOKS, PRODUCT_CATEGORY.HOBBY],
      manufacturer: 'GuidePro',
      createdAt: t,
      updatedAt: t,
    }),
    Product.create({
      id: 'mock-product-3',
      name: 'Photo Pack',
      slug: 'photo-pack',
      price: 19.99,
      currency: 'USD',
      categories: [PRODUCT_CATEGORY.HOBBY, PRODUCT_CATEGORY.FOR_MEN],
      manufacturer: 'PhotoLab',
      createdAt: t,
      updatedAt: t,
    }),
    Product.create({
      id: 'mock-product-4',
      name: 'Yoga Basics',
      slug: 'yoga-basics',
      price: 14.99,
      currency: 'USD',
      description: 'Yoga for beginners.',
      categories: [PRODUCT_CATEGORY.HEALTH, PRODUCT_CATEGORY.SPORT, PRODUCT_CATEGORY.FOR_WOMEN],
      manufacturer: 'FitLife',
      createdAt: t,
      updatedAt: t,
    }),
    Product.create({
      id: 'mock-product-5',
      name: 'Running Plan',
      slug: 'running-plan',
      price: 12.99,
      currency: 'USD',
      categories: [PRODUCT_CATEGORY.SPORT, PRODUCT_CATEGORY.FOR_MEN],
      manufacturer: 'FitLife',
      createdAt: t,
      updatedAt: t,
    }),
    Product.create({
      id: 'mock-product-6',
      name: 'Healthy Snacks E-book',
      slug: 'healthy-snacks-ebook',
      price: 5.99,
      currency: 'USD',
      categories: [PRODUCT_CATEGORY.HEALTH, PRODUCT_CATEGORY.FOOD, PRODUCT_CATEGORY.BOOKS],
      manufacturer: 'GuidePro',
      createdAt: t,
      updatedAt: t,
    }),
    Product.create({
      id: 'mock-product-7',
      name: 'Kids Fitness',
      slug: 'kids-fitness',
      price: 9.99,
      currency: 'USD',
      categories: [PRODUCT_CATEGORY.SPORT, PRODUCT_CATEGORY.FOR_CHILDREN, PRODUCT_CATEGORY.PROMOTIONS],
      manufacturer: 'FitLife',
      createdAt: t,
      updatedAt: t,
    }),
    Product.create({
      id: 'mock-product-8',
      name: 'Cookbook: Quick Meals',
      slug: 'cookbook-quick-meals',
      price: 11.99,
      currency: 'USD',
      categories: [PRODUCT_CATEGORY.FOOD, PRODUCT_CATEGORY.BOOKS],
      manufacturer: 'GuidePro',
      createdAt: t,
      updatedAt: t,
    }),
  ];

  const existing = await productRepository.findAll();
  const existingIds = new Set(existing.map((p) => p.id));

  const baseToAdd = baseProducts.filter((p) => !existingIds.has(p.id));
  const bulkToAdd = buildBulkProducts(t).filter((p) => !existingIds.has(p.id));
  const toAdd = [...baseToAdd, ...bulkToAdd];

  if (toAdd.length === 0) {
    console.info('[seed] mock products: inserted 0 (all ids already present)');
    return { inserted: 0 };
  }

  const chunk = insertChunkSize();
  let inserted = 0;
  for (let i = 0; i < toAdd.length; i += chunk) {
    const slice = toAdd.slice(i, i + chunk);
    await productRepository.saveMany(slice);
    inserted += slice.length;
  }

  console.info(`[seed] mock products: inserted ${inserted} (chunk size ${chunk})`);
  return { inserted };
}

export async function seedCategories(repository: ICategoryRepository): Promise<void> {
  const t = now();
  const categories = PRODUCT_CATEGORY_CODES.map((code) =>
    Category.create({
      code,
      name: categoryLabel(code),
      createdAt: t,
      updatedAt: t,
    }),
  );
  await repository.upsertMany(categories);
  console.info(`[seed] categories: upserted ${categories.length}`);
}

function isoDaysFromNow(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

const PROMOTION_FIXTURES = [
  {
    id: 'seed-promo-summer-sale',
    name: 'Summer Sale',
    description: 'Seasonal discount on selected products.',
    discountPct: 20,
    validFrom: -7,
    validTo: 30,
    isActive: true,
    productSlugPrefixes: ['sport-sample-', 'for-men-sample-'],
    productSlugTake: 4,
  },
  {
    id: 'seed-promo-health-boost',
    name: 'Health Boost',
    description: 'Discount on health products.',
    discountPct: 10,
    validFrom: -2,
    validTo: 14,
    isActive: true,
    productSlugPrefixes: ['health-sample-'],
    productSlugTake: 3,
  },
  {
    id: 'seed-promo-spring-expired',
    name: 'Spring Sale (expired)',
    description: 'Used to demo a promotion outside its validity window.',
    discountPct: 15,
    validFrom: -60,
    validTo: -30,
    isActive: true,
    productSlugPrefixes: ['hobby-sample-'],
    productSlugTake: 2,
  },
];

export async function seedPromotions(
  promotionRepository: IPromotionRepository,
  productRepository: IProductRepository,
): Promise<void> {
  const t = now();
  const allProducts = await productRepository.findAll();
  let createdOrUpdated = 0;
  for (const fixture of PROMOTION_FIXTURES) {
    const matchingProducts = allProducts
      .filter((p) => fixture.productSlugPrefixes.some((prefix) => p.slug.startsWith(prefix)))
      .slice(0, fixture.productSlugTake)
      .map((p) => ({ productId: p.id, discountPctOverride: null }));

    if (matchingProducts.length === 0) {
      continue;
    }

    const promotion = Promotion.create({
      id: fixture.id,
      name: fixture.name,
      description: fixture.description,
      discountPct: fixture.discountPct,
      validFrom: isoDaysFromNow(fixture.validFrom),
      validTo: isoDaysFromNow(fixture.validTo),
      isActive: fixture.isActive,
      products: matchingProducts,
      createdAt: t,
      updatedAt: t,
    });
    await promotionRepository.save(promotion);
    createdOrUpdated += 1;
  }

  console.info(`[seed] promotions: upserted ${createdOrUpdated}`);
}

export async function seedDemoUsers(prisma: PrismaClient): Promise<void> {
  const now = new Date().toISOString();
  const users: { email: string; password: string; role: string }[] = [
    { email: 'demo@seed.local', password: 'demo', role: 'user' },
    { email: 'admin@seed.local', password: 'admin', role: 'admin' },
  ];
  for (const u of users) {
    const password = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      create: {
        email: u.email,
        password,
        role: u.role,
        createdAt: now,
        updatedAt: now,
      },
      update: {
        password,
        role: u.role,
        updatedAt: now,
      },
    });
  }
  console.info('[seed] demo users: demo@seed.local / demo (user), admin@seed.local / admin (admin)');
}
