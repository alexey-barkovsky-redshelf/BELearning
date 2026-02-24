/**
 * Record that a user has been granted access to a product (e.g. after purchase).
 * Product can be consumed as web view or download; that is defined on Product later.
 */
export interface UserProductAccess {
  userId: string;
  productId: string;
  grantedAt: string;
  sourceOrderId?: string;
  /** If set, access is valid only until this time (e.g. subscription). */
  expiresAt?: string;
}
