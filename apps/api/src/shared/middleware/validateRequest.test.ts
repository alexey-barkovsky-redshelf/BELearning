import type { NextFunction, Request, Response } from 'express';
import {
  createOrderBodySchema,
  createProductBodySchema,
  listProductsQuerySchema,
  orderIdParamSchema,
  orderUserIdParamSchema,
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
  it('sets validatedQuery for empty query', () => {
    const middleware = validateQuery(listProductsQuerySchema);
    const req = { query: {} } as unknown as Request;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.validatedQuery).toEqual({});
  });

  it('sets category when string', () => {
    const middleware = validateQuery(listProductsQuerySchema);
    const req = { query: { category: 'health' } } as unknown as Request;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.validatedQuery).toEqual({ category: 'health' });
  });

  it('uses first category when Express passes array', () => {
    const middleware = validateQuery(listProductsQuerySchema);
    const req = { query: { category: ['health', 'sport'] } } as unknown as Request;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.validatedQuery).toEqual({ category: 'health' });
  });

  it('rejects null category', () => {
    const middleware = validateQuery(listProductsQuerySchema);
    const req = { query: { category: null } } as unknown as Request;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('rejects undefined as explicit category value in malformed query', () => {
    const middleware = validateQuery(listProductsQuerySchema);
    const req = { query: { category: undefined } } as unknown as Request;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.validatedQuery).toEqual({});
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
