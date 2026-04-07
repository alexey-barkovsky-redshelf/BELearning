import { listProductsQuerySchema, type ListProductsQuery } from './schemas/product';

export type SearchParamsLike = {
  keys(): IterableIterator<string>;
  getAll(name: string): string[];
};

export function queryRecordFromSearchParamsLike(sp: SearchParamsLike): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const seen = new Set<string>();
  for (const key of sp.keys()) {
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    const all = sp.getAll(key);
    if (all.length === 0) {
      continue;
    }
    out[key] = all.length === 1 ? all[0] : all;
  }
  return out;
}

export function parseListProductsQueryFromQueryRecord(raw: Record<string, unknown>): ListProductsQuery {
  const first = listProductsQuerySchema.safeParse(raw);
  if (first.success) {
    return first.data;
  }
  const stripped: Record<string, unknown> = { ...raw };
  delete stripped.minPrice;
  delete stripped.maxPrice;
  const second = listProductsQuerySchema.safeParse(stripped);
  if (second.success) {
    return second.data;
  }
  return listProductsQuerySchema.parse({});
}

export function parseListProductsQueryFromUrlSearchParams(sp: SearchParamsLike): ListProductsQuery {
  return parseListProductsQueryFromQueryRecord(queryRecordFromSearchParamsLike(sp));
}
