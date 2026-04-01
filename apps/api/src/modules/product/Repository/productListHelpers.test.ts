import type { ListProductsQuery, ProductCategoryCode } from '@belearning/shared';
import { DEFAULT_LIST_PRODUCTS_PAGE_SIZE } from '@belearning/shared';
import { Product } from '../Models/index.js';
import { runProductListPipeline } from './productListHelpers.js';

const TS_JAN1 = '2020-01-01T00:00:00.000Z';
const TS_JAN2 = '2020-01-02T00:00:00.000Z';
const TS_JAN3 = '2020-01-03T00:00:00.000Z';

function p(params: {
  id: string;
  name: string;
  slug: string;
  price: number;
  categories?: ProductCategoryCode[];
  manufacturer?: string;
  createdAt: string;
}): Product {
  return Product.create({
    id: params.id,
    name: params.name,
    slug: params.slug,
    price: params.price,
    currency: 'USD',
    categories: params.categories,
    manufacturer: params.manufacturer,
    createdAt: params.createdAt,
    updatedAt: params.createdAt,
  });
}

function baseQuery(over: Partial<ListProductsQuery> = {}): ListProductsQuery {
  return {
    page: 1,
    pageSize: 10,
    sortBy: 'name',
    order: 'asc',
    ...over,
  };
}

describe('runProductListPipeline', () => {
  const items = [
    p({ id: '1', name: 'Alpha', slug: 'alpha', price: 30, categories: ['health'], createdAt: TS_JAN2 }),
    p({ id: '2', name: 'Beta', slug: 'beta', price: 10, categories: ['books'], createdAt: TS_JAN1 }),
    p({ id: '3', name: 'Gamma', slug: 'gamma', price: 20, categories: ['sport', 'health'], createdAt: TS_JAN3 }),
  ];

  it('filters by category', () => {
    const q = baseQuery({ category: ['health'] });
    const { items: out, total } = runProductListPipeline(items, q);
    expect(total).toBe(2);
    expect(out.map((x) => x.id).sort()).toEqual(['1', '3']);
  });

  it('filters by min and max price in full mode', () => {
    const q = baseQuery({ minPrice: 15, maxPrice: 25 });
    const { items: out, total } = runProductListPipeline(items, q, 'full');
    expect(total).toBe(1);
    expect(out[0].id).toBe('3');
  });

  it('does not apply price filter in dbPrefiltered mode', () => {
    const q = baseQuery({ minPrice: 15, maxPrice: 25 });
    const { total } = runProductListPipeline(items, q, 'dbPrefiltered');
    expect(total).toBe(3);
  });

  it('filters by search on name and manufacturer in full mode', () => {
    const withMfr = [
      ...items,
      p({
        id: '4',
        name: 'Zed',
        slug: 'zed',
        price: 5,
        createdAt: TS_JAN1,
        manufacturer: 'AcmeVitamin',
      }),
    ];
    const q = baseQuery({ search: 'vitamin' });
    const { items: out, total } = runProductListPipeline(withMfr, q, 'full');
    expect(total).toBe(1);
    expect(out[0].id).toBe('4');
  });

  it('sorts by price desc', () => {
    const q = baseQuery({ sortBy: 'price', order: 'desc', pageSize: DEFAULT_LIST_PRODUCTS_PAGE_SIZE });
    const { items: out } = runProductListPipeline(items, q);
    expect(out.map((x) => x.id)).toEqual(['1', '3', '2']);
  });

  it('sorts by createdAt asc', () => {
    const q = baseQuery({ sortBy: 'createdAt', order: 'asc', pageSize: DEFAULT_LIST_PRODUCTS_PAGE_SIZE });
    const { items: out } = runProductListPipeline(items, q);
    expect(out.map((x) => x.id)).toEqual(['2', '1', '3']);
  });

  it('paginates', () => {
    const fixed = baseQuery({ page: 2, pageSize: 2 });
    const { items: out, total } = runProductListPipeline(items, fixed);
    expect(total).toBe(3);
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe('3');
  });
});
