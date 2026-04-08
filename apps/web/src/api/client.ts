import {
  type Category,
  DEFAULT_LIST_PRODUCTS_PAGE_SIZE,
  type ListProductsPageSize,
  type ListProductsQuery,
  type Order,
  type OrderItem,
  type PaginatedProducts,
  type Product,
  type ProductCategoryCode,
} from '@belearning/shared';
import { PRODUCT_CATEGORY_CODES } from '@belearning/utils';
import { getAuthToken } from './authHeader';

const BASE = (import.meta as { env?: { VITE_API_BASE?: string } }).env?.VITE_API_BASE ?? '/api';

export interface ApiErrorPayload {
  error: string;
  code?: string;
}

export type AuthUser = {
  id: string;
  loginId: string;
  role: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type AdminUserRow = {
  id: string;
  loginId: string;
  role: string;
  createdAt: string;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const authHeaders: Record<string, string> =
    token !== null && token.length > 0 ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders, ...options?.headers },
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

export type {
  Product,
  ProductCategoryCode,
  OrderItem,
  Order,
  Category,
  PaginatedProducts,
  ListProductsQuery,
  ListProductsPageSize,
};
export { DEFAULT_LIST_PRODUCTS_PAGE_SIZE, PRODUCT_CATEGORY_CODES };

function productListQueryString(params?: Partial<ListProductsQuery>): string {
  const qs = new URLSearchParams();
  if (params?.category !== undefined && params.category.length > 0) {
    qs.set('category', params.category.join(','));
  }
  if (params?.search) {
    qs.set('search', params.search);
  }
  if (params?.minPrice !== undefined) {
    qs.set('minPrice', String(params.minPrice));
  }
  if (params?.maxPrice !== undefined) {
    qs.set('maxPrice', String(params.maxPrice));
  }
  if (params?.page !== undefined) {
    qs.set('page', String(params.page));
  }
  if (params?.pageSize !== undefined && params.pageSize !== DEFAULT_LIST_PRODUCTS_PAGE_SIZE) {
    qs.set('pageSize', String(params.pageSize));
  }
  if (params?.sortBy) {
    qs.set('sortBy', params.sortBy);
  }
  if (params?.order) {
    qs.set('order', params.order);
  }
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export const api = {
  getCategories: () => request<Category[]>('/categories'),
  getProducts: (params?: Partial<ListProductsQuery>) =>
    request<PaginatedProducts>(`/products${productListQueryString(params)}`),
  getProduct: (id: string) => request<Product>(`/products/${id}`),
  getProductBySlug: (slug: string) => request<Product>(`/products/slug/${slug}`),

  login: (body: { loginId: string; password: string }) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body: { loginId: string; password: string }) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  createOrder: (body: { items: OrderItem[]; currency?: string }) =>
    request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify({ ...body, currency: body.currency ?? 'USD' }),
    }),
  getOrder: (id: string) => request<Order>(`/orders/${id}`),
  getMyOrders: () => request<Order[]>('/orders/me'),
  getOrdersByUser: (userId: string) => request<Order[]>(`/orders/user/${userId}`),
  markOrderPaid: (id: string) => request<Order>(`/orders/${id}/paid`, { method: 'POST' }),

  adminListUsers: () => request<AdminUserRow[]>('/admin/users'),
  adminListOrders: () => request<Order[]>('/admin/orders'),
};
