import type { Product, ProductCategoryCode, OrderItem, Order, Category } from '@belearning/shared';
import { PRODUCT_CATEGORY_CODES } from '@belearning/utils';

const BASE = (import.meta as { env?: { VITE_API_BASE?: string } }).env?.VITE_API_BASE ?? '/api';

export interface ApiErrorPayload {
  error: string;
  code?: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const payload: ApiErrorPayload = await res
      .json()
      .then((data: unknown) => ({
        error: typeof (data as ApiErrorPayload).error === 'string' ? (data as ApiErrorPayload).error : res.statusText,
        code: typeof (data as ApiErrorPayload).code === 'string' ? (data as ApiErrorPayload).code : undefined,
      }))
      .catch(() => ({ error: res.statusText }));
    throw new Error(payload.error);
  }
  return res.json() as Promise<T>;
}

export type { Product, ProductCategoryCode, OrderItem, Order, Category };
export { PRODUCT_CATEGORY_CODES };

export const api = {
  getCategories: () => request<Category[]>('/categories'),
  getProducts: (category?: string) =>
    request<Product[]>(category ? `/products?category=${encodeURIComponent(category)}` : '/products'),
  getProduct: (id: string) => request<Product>(`/products/${id}`),
  getProductBySlug: (slug: string) => request<Product>(`/products/slug/${slug}`),

  createOrder: (body: { userId: string; items: OrderItem[]; currency?: string }) =>
    request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify({ ...body, currency: body.currency ?? 'USD' }),
    }),
  getOrder: (id: string) => request<Order>(`/orders/${id}`),
  getOrdersByUser: (userId: string) => request<Order[]>(`/orders/user/${userId}`),
  markOrderPaid: (id: string) => request<Order>(`/orders/${id}/paid`, { method: 'POST' }),
};
