-- Add a real Category table so ProductCategory becomes a proper N:M join.
-- Steps:
--   1. Create Category with `code` as the natural primary key.
--   2. Backfill Category from existing distinct codes in ProductCategory so the
--      new FK constraint can be added without violating any existing row.
--   3. Recreate ProductCategory with a foreign key from `code` -> Category.code.
--      Composite primary key (productId, code) is preserved; the leading column
--      is productId, so lookups by productId already use the PK index.
--      A separate index on `code` (categoryCode side) is added because the
--      composite PK index can't be used for queries that filter only by code
--      (leftmost-prefix rule).

CREATE TABLE "Category" (
    "code"      TEXT NOT NULL PRIMARY KEY,
    "name"      TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL
);

INSERT INTO "Category" ("code", "name", "createdAt", "updatedAt")
SELECT DISTINCT
    pc."code",
    pc."code" AS "name",
    '2026-06-16T00:00:00.000Z',
    '2026-06-16T00:00:00.000Z'
FROM "ProductCategory" pc;

PRAGMA foreign_keys=OFF;

CREATE TABLE "ProductCategory_new" (
    "productId" TEXT NOT NULL,
    "code"      TEXT NOT NULL,
    PRIMARY KEY ("productId", "code"),
    CONSTRAINT "ProductCategory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProductCategory_code_fkey"      FOREIGN KEY ("code")      REFERENCES "Category" ("code") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "ProductCategory_new" ("productId", "code")
SELECT "productId", "code" FROM "ProductCategory";

DROP TABLE "ProductCategory";
ALTER TABLE "ProductCategory_new" RENAME TO "ProductCategory";

CREATE INDEX "ProductCategory_code_idx" ON "ProductCategory"("code");

PRAGMA foreign_keys=ON;
