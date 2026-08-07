export interface PromotionProduct {
  productId: string;
  discountPctOverride?: number | null;
}

export interface Promotion {
  id: string;
  name: string;
  description?: string | null;
  discountPct: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  products: PromotionProduct[];
}
