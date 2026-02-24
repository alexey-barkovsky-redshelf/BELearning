const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export type ProductCategoryCode = 'health' | 'sport' | 'hobby' | 'promotions' | 'for_men' | 'for_women' | 'for_children' | 'food' | 'books';

export type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  description?: string;
  categories?: ProductCategoryCode[];
  manufacturer?: string;
};

export const PRODUCT_CATEGORY_CODES: ProductCategoryCode[] = [
  'health', 'sport', 'hobby', 'promotions', 'for_men', 'for_women', 'for_children', 'food', 'books',
];

export type Category = { code: string };

export const api = {
  getCategories: () => request<Category[]>('/categories'),
  getProducts: (category?: string) =>
    request<Product[]>(category ? `/products?category=${encodeURIComponent(category)}` : '/products'),
  getProduct: (id: string) => request<Product>(`/products/${id}`),
  getProductBySlug: (slug: string) => request<Product>(`/products/slug/${slug}`),

  createOrder: (body: { userId: string; items: Array<{ productId: string; productTitle: string; priceAtPurchase: number; quantity: number }>; currency?: string }) =>
    request<{ id: string; userId: string; status: string; totalAmount: number; currency: string; items: unknown[]; createdAt: string; updatedAt: string }>('/orders', {
      method: 'POST',
      body: JSON.stringify({ ...body, currency: body.currency ?? 'USD' }),
    }),
  getOrder: (id: string) => request<{ id: string; userId: string; status: string; totalAmount: number; currency: string; items: unknown[]; createdAt: string; updatedAt: string }>(`/orders/${id}`),
  getOrdersByUser: (userId: string) => request<Array<{ id: string; userId: string; status: string; totalAmount: number; currency: string; items: unknown[]; createdAt: string; updatedAt: string }>>(`/orders/user/${userId}`),
  markOrderPaid: (id: string) =>
    request<{ id: string; userId: string; status: string; totalAmount: number; currency: string; items: unknown[]; createdAt: string; updatedAt: string }>(`/orders/${id}/paid`, { method: 'POST' }),

};
