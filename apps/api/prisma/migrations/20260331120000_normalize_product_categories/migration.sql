CREATE TABLE "ProductCategory" (
    "productId" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    PRIMARY KEY ("productId", "code"),
    CONSTRAINT "ProductCategory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "ProductCategory_code_idx" ON "ProductCategory"("code");

INSERT INTO "ProductCategory" ("productId", "code")
SELECT p."id", j.value
FROM "Product" p, json_each(p."categories") AS j
WHERE p."categories" IS NOT NULL
  AND TRIM(p."categories") != ''
  AND TRIM(p."categories") != '[]';

PRAGMA foreign_keys=OFF;
ALTER TABLE "Product" DROP COLUMN "categories";
PRAGMA foreign_keys=ON;
