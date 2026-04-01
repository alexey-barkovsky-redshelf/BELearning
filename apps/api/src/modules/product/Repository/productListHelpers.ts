import type { ListProductsQuery } from '@belearning/shared';
import { Product } from '../Models/index.js';

export type ProductListPipelineMode = 'full' | 'dbPrefiltered';

function matchesSearch(p: Product, qLower: string): boolean {
  if (p.name.toLowerCase().includes(qLower)) {
    return true;
  }
  const m = p.manufacturer;
  return m !== undefined && m.toLowerCase().includes(qLower);
}

export function runProductListPipeline(
  products: Product[],
  query: ListProductsQuery,
  mode: ProductListPipelineMode = 'full',
): { items: Product[]; total: number } {
  let rows = products;

  if (mode === 'full') {
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      rows = rows.filter((p) => {
        const price = p.price;
        if (query.minPrice !== undefined && price < query.minPrice) {
          return false;
        }
        if (query.maxPrice !== undefined && price > query.maxPrice) {
          return false;
        }
        return true;
      });
    }
    if (query.search !== undefined) {
      const q = query.search.toLowerCase();
      rows = rows.filter((p) => matchesSearch(p, q));
    }
  }

  if (query.category !== undefined && query.category.length > 0) {
    const wanted = new Set(query.category);
    rows = rows.filter((p) => p.categories?.some((c) => wanted.has(c)) ?? false);
  }

  rows = [...rows].sort((a, b) => compareForSort(a, b, query));
  const total = rows.length;
  const start = (query.page - 1) * query.pageSize;
  return { items: rows.slice(start, start + query.pageSize), total };
}

function compareForSort(a: Product, b: Product, query: ListProductsQuery): number {
  let n = 0;
  switch (query.sortBy) {
    case 'name':
      n = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      break;
    case 'price':
      n = a.price - b.price;
      break;
    default:
      n = a.createdAt.localeCompare(b.createdAt);
  }
  return query.order === 'asc' ? n : -n;
}
