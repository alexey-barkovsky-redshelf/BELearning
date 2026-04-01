import type { NextFunction, Request, Response } from 'express';
import {
  createOrderBodySchema,
  createProductBodySchema,
  LIST_PRODUCTS_CATEGORY_PARAM_MAX_LENGTH,
  LIST_PRODUCTS_SEARCH_MAX_LENGTH,
  listProductsQuerySchema,
  orderIdParamSchema,
  orderUserIdParamSchema,
  parseListProductsQueryFromQueryRecord,
  productIdParamSchema,
} from '@belearning/shared';
import { validateBody, validateParams, validateQuery } from './validateRequest.js';

function createMockRes(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const validOrderItem = {
  productId: 'p-1',
  productTitle: 'Item',
  priceAtPurchase: 9.99,
  quantity: 2,
};

const validCreateOrderBody = {
  userId: 'user-1',
  items: [validOrderItem],
};

describe('validateBody', () => {
  it('sets validatedBody and calls next for a valid payload', () => {
    const middleware = validateBody(createOrderBodySchema);
    const req = { body: { ...validCreateOrderBody } } as Request;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(req.validatedBody).toEqual(validCreateOrderBody);
  });

  it('accepts optional currency when present', () => {
    const middleware = validateBody(createOrderBodySchema);
    const req = {
      body: { ...validCreateOrderBody, currency: 'EUR' },
    } as Request;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect((req.validatedBody as { currency?: string }).currency).toBe('EUR');
  });

  it('rejects undefined body', () => {
    const middleware = validateBody(createOrderBodySchema);
    const req = { body: undefined } as unknown as Request;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Validation failed', issues: expect.any(Object) }),
    );
  });

  it('rejects null body', () => {
    const middleware = validateBody(createOrderBodySchema);
    const req = { body: null } as unknown as Request;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('rejects empty userId string', () => {
    const middleware = validateBody(createOrderBodySchema);
    const req = {
      body: { ...validCreateOrderBody, userId: '' },
    } as Request;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('rejects whitespace-only userId', () => {
    const middleware = validateBody(createOrderBodySchema);
    const req = {
      body: { ...validCreateOrderBody, userId: '   ' },
    } as Request;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('rejects empty items array', () => {
    const middleware = validateBody(createOrderBodySchema);
    const req = {
      body: { userId: 'user-1', items: [] },
    } as Request;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('rejects empty string productId in item', () => {
    const middleware = validateBody(createOrderBodySchema);
    const req = {
      body: {
        userId: 'user-1',
        items: [{ ...validOrderItem, productId: '' }],
      },
    } as Request;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('rejects non-number priceAtPurchase', () => {
    const middleware = validateBody(createOrderBodySchema);
    const req = {
      body: {
        userId: 'user-1',
        items: [{ ...validOrderItem, priceAtPurchase: '9.99' }],
      },
    } as unknown as Request;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('rejects zero quantity', () => {
    const middleware = validateBody(createOrderBodySchema);
    const req = {
      body: {
        userId: 'user-1',
        items: [{ ...validOrderItem, quantity: 0 }],
      },
    } as Request;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  describe('createProductBodySchema', () => {
    const validProduct = {
      name: 'Book',
      slug: 'book',
      price: 12.5,
    };

    it('sets validatedBody for minimal valid product', () => {
      const middleware = validateBody(createProductBodySchema);
      const req = { body: { ...validProduct } } as Request;
      const res = createMockRes();
      const next = jest.fn() as NextFunction;

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.validatedBody).toEqual(validProduct);
    });

    it('rejects empty name', () => {
      const middleware = validateBody(createProductBodySchema);
      const req = { body: { ...validProduct, name: '' } } as Request;
      const res = createMockRes();
      const next = jest.fn() as NextFunction;

      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects zero price', () => {
      const middleware = validateBody(createProductBodySchema);
      const req = { body: { ...validProduct, price: 0 } } as Request;
      const res = createMockRes();
      const next = jest.fn() as NextFunction;

      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects invalid category code', () => {
      const middleware = validateBody(createProductBodySchema);
      const req = {
        body: { ...validProduct, categories: ['not-a-code'] },
      } as unknown as Request;
      const res = createMockRes();
      const next = jest.fn() as NextFunction;

      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});

describe('validateQuery', () => {
  const defaultListQuery = {
    page: 1,
    pageSize: 25,
    sortBy: 'name',
    order: 'asc' as const,
  };

  it('sets validatedQuery with defaults for empty query', () => {
    const middleware = validateQuery(listProductsQuerySchema);
    const req = { query: {} } as unknown as Request;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.validatedQuery).toEqual(defaultListQuery);
  });

  it('sets category as array when string and merges defaults', () => {
    const middleware = validateQuery(listProductsQuerySchema);
    const req = { query: { category: 'health' } } as unknown as Request;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.validatedQuery).toEqual({ ...defaultListQuery, category: ['health'] });
  });

  it('merges multiple categories from comma-separated string', () => {
    const middleware = validateQuery(listProductsQuerySchema);
    const req = { query: { category: 'health,sport' } } as unknown as Request;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.validatedQuery).toEqual({ ...defaultListQuery, category: ['health', 'sport'] });
  });

  it('merges multiple categories from Express array', () => {
    const middleware = validateQuery(listProductsQuerySchema);
    const req = { query: { category: ['health', 'sport'] } } as unknown as Request;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.validatedQuery).toEqual({ ...defaultListQuery, category: ['health', 'sport'] });
  });

  it('treats null category as omitted', () => {
    const middleware = validateQuery(listProductsQuerySchema);
    const req = { query: { category: null } } as unknown as Request;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.validatedQuery).toEqual(defaultListQuery);
  });

  it('parses page and pageSize', () => {
    const middleware = validateQuery(listProductsQuerySchema);
    const req = { query: { page: '2', pageSize: '10' } } as unknown as Request;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.validatedQuery).toEqual({ ...defaultListQuery, page: 2, pageSize: 10 });
  });

  it('coerces non-positive page to 1', () => {
    const middleware = validateQuery(listProductsQuerySchema);
    const req = { query: { page: '0' } } as unknown as Request;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.validatedQuery).toEqual(defaultListQuery);
  });

  it('parseListProductsQueryFromQueryRecord matches validateQuery output', () => {
    const raw: Record<string, unknown> = {
      page: '2',
      pageSize: '10',
      category: 'health,sport',
      search: 'vitamin',
      minPrice: '5',
      maxPrice: '99',
      sortBy: 'price',
      order: 'desc',
    };
    const middleware = validateQuery(listProductsQuerySchema);
    const req = { query: raw } as unknown as Request;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(parseListProductsQueryFromQueryRecord(raw)).toEqual(req.validatedQuery);
  });

  it('parseListProductsQueryFromQueryRecord drops prices when max below min', () => {
    const raw: Record<string, unknown> = {
      minPrice: '10',
      maxPrice: '5',
    };
    expect(parseListProductsQueryFromQueryRecord(raw)).toEqual(defaultListQuery);
  });

  it('defaults invalid pageSize to 25', () => {
    const middleware = validateQuery(listProductsQuerySchema);
    const req = { query: { pageSize: '12' } } as unknown as Request;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.validatedQuery).toEqual(defaultListQuery);
  });

  it('rejects when maxPrice is less than minPrice', () => {
    const middleware = validateQuery(listProductsQuerySchema);
    const req = { query: { minPrice: '10', maxPrice: '5' } } as unknown as Request;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('rejects search longer than LIST_PRODUCTS_SEARCH_MAX_LENGTH', () => {
    const middleware = validateQuery(listProductsQuerySchema);
    const longSearch = 'a'.repeat(LIST_PRODUCTS_SEARCH_MAX_LENGTH + 1);
    const req = { query: { search: longSearch } } as unknown as Request;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('accepts search at LIST_PRODUCTS_SEARCH_MAX_LENGTH', () => {
    const middleware = validateQuery(listProductsQuerySchema);
    const search = 'a'.repeat(LIST_PRODUCTS_SEARCH_MAX_LENGTH);
    const req = { query: { search } } as unknown as Request;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.validatedQuery).toEqual({ ...defaultListQuery, search });
  });

  it('rejects category raw string longer than LIST_PRODUCTS_CATEGORY_PARAM_MAX_LENGTH', () => {
    const middleware = validateQuery(listProductsQuerySchema);
    const req = {
      query: { category: 'x'.repeat(LIST_PRODUCTS_CATEGORY_PARAM_MAX_LENGTH + 1) },
    } as unknown as Request;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('validateParams', () => {
  it('sets validatedParams for valid order id', () => {
    const middleware = validateParams(orderIdParamSchema);
    const req = { params: { id: 'order-1' } } as unknown as Request;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.validatedParams).toEqual({ id: 'order-1' });
  });

  it('rejects empty id', () => {
    const middleware = validateParams(orderIdParamSchema);
    const req = { params: { id: '' } } as unknown as Request;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('rejects whitespace-only id', () => {
    const middleware = validateParams(orderIdParamSchema);
    const req = { params: { id: '  ' } } as unknown as Request;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('validates userId param', () => {
    const middleware = validateParams(orderUserIdParamSchema);
    const req = { params: { userId: 'user-1' } } as unknown as Request;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.validatedParams).toEqual({ userId: 'user-1' });
  });

  it('rejects empty userId', () => {
    const middleware = validateParams(orderUserIdParamSchema);
    const req = { params: { userId: '' } } as unknown as Request;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('rejects product id param when empty', () => {
    const middleware = validateParams(productIdParamSchema);
    const req = { params: { id: '' } } as unknown as Request;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
