export type OrderStatus = 'draft' | 'paid' | 'cancelled';

export interface OrderItem {
  productId: string;
  productTitle: string;
  priceAtPurchase: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}
