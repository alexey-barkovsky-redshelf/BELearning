-- Indexes for Order and OrderItem.
--   * Order(userId)              -> "/orders/me" and admin "by user" lookups.
--   * Order(status, createdAt)   -> composite for "list paid orders newest first"
--                                   (and similar status-filtered, date-sorted queries).
--   * OrderItem(orderId)         -> SQLite does NOT auto-index FK columns; this
--                                   speeds up the JOIN from Order -> items in every
--                                   order detail/list query.
--   * OrderItem(productId)       -> "orders containing product X" and analytics
--                                   like top-selling products (group by productId).

CREATE INDEX "Order_userId_idx"             ON "Order"("userId");
CREATE INDEX "Order_status_createdAt_idx"   ON "Order"("status", "createdAt");
CREATE INDEX "OrderItem_orderId_idx"        ON "OrderItem"("orderId");
CREATE INDEX "OrderItem_productId_idx"      ON "OrderItem"("productId");
