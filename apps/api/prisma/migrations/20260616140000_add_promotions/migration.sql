-- Promotions: a many-to-many between Promotion and Product with payload columns
-- on the join table.
--   Promotion holds the campaign-level fields (name, default discountPct, validity window, isActive).
--   PromotionProduct is the join with composite PK (promotionId, productId) and an
--   optional per-product override (discountPctOverride).
--
-- Indexes:
--   * Promotion(validFrom, validTo) -> composite index for "active promotions today" queries.
--     Postgres/SQLite use this when the leftmost column (validFrom) is constrained;
--     for ranges it still helps narrow the scan.
--   * Promotion(isActive) -> filter cheap admin toggles without scanning.
--   * PromotionProduct PK already indexes (promotionId) as the leading column.
--   * PromotionProduct(productId) -> needed because composite PK index does not serve
--     queries that filter only by productId (leftmost-prefix rule).

CREATE TABLE "Promotion" (
    "id"          TEXT    NOT NULL PRIMARY KEY,
    "name"        TEXT    NOT NULL,
    "description" TEXT,
    "discountPct" REAL    NOT NULL,
    "validFrom"   TEXT    NOT NULL,
    "validTo"     TEXT    NOT NULL,
    "isActive"    BOOLEAN NOT NULL DEFAULT true,
    "createdAt"   TEXT    NOT NULL,
    "updatedAt"   TEXT    NOT NULL
);

CREATE INDEX "Promotion_validFrom_validTo_idx" ON "Promotion"("validFrom", "validTo");
CREATE INDEX "Promotion_isActive_idx"          ON "Promotion"("isActive");

CREATE TABLE "PromotionProduct" (
    "promotionId"         TEXT NOT NULL,
    "productId"           TEXT NOT NULL,
    "discountPctOverride" REAL,
    PRIMARY KEY ("promotionId", "productId"),
    CONSTRAINT "PromotionProduct_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PromotionProduct_productId_fkey"   FOREIGN KEY ("productId")   REFERENCES "Product"   ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "PromotionProduct_productId_idx" ON "PromotionProduct"("productId");
