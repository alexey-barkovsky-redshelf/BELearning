import { PRODUCT_CATEGORY } from '@belearning/shared';
import { Product } from '../domain/Product.js';
import type { IProductRepository } from '../repositories/interfaces/IProductRepository.js';

function now(): string {
  return new Date().toISOString();
}

export async function seedMockData(productRepository: IProductRepository): Promise<void> {
  const t = now();

  const products = [
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

  for (const product of products) {
    await productRepository.save(product);
  }
}
