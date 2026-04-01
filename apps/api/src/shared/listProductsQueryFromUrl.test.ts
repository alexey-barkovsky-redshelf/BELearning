import {
  listProductsQuerySchema,
  parseListProductsQueryFromQueryRecord,
  parseListProductsQueryFromUrlSearchParams,
  queryRecordFromSearchParamsLike,
} from '@belearning/shared';

function recordFromQs(qs: string): Record<string, unknown> {
  const sp = new URLSearchParams(qs);
  return queryRecordFromSearchParamsLike(sp);
}

describe('parseListProductsQueryFromUrlSearchParams parity with listProductsQuerySchema', () => {
  const cases = [
    '',
    'page=2&pageSize=10',
    'category=health,sport',
    'search=hello&sortBy=price&order=desc',
    'minPrice=1&maxPrice=99',
  ];

  it.each(cases)('matches safeParse for %s', (qs) => {
    const sp = new URLSearchParams(qs);
    const fromUrl = parseListProductsQueryFromUrlSearchParams(sp);
    const raw = recordFromQs(qs);
    const parsed = listProductsQuerySchema.safeParse(raw);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(fromUrl).toEqual(parsed.data);
    }
  });

  it('matches validateQuery-style output for typical product list URL', () => {
    const qs =
      'page=3&pageSize=50&category=books&search=test&minPrice=5&maxPrice=100&sortBy=createdAt&order=desc';
    const sp = new URLSearchParams(qs);
    const fromUrl = parseListProductsQueryFromUrlSearchParams(sp);
    const parsed = listProductsQuerySchema.safeParse(recordFromQs(qs));
    expect(parsed.success).toBe(true);
    expect(fromUrl).toEqual(parsed.data);
  });

  it('parseListProductsQueryFromUrlSearchParams matches parseListProductsQueryFromQueryRecord for invalid price pair', () => {
    const qs = 'minPrice=10&maxPrice=5&page=2';
    const sp = new URLSearchParams(qs);
    const raw = recordFromQs(qs);
    expect(listProductsQuerySchema.safeParse(raw).success).toBe(false);
    const fromUrl = parseListProductsQueryFromUrlSearchParams(sp);
    const fromRecord = parseListProductsQueryFromQueryRecord(raw);
    expect(fromUrl).toEqual(fromRecord);
    expect(fromUrl.page).toBe(2);
  });
});
