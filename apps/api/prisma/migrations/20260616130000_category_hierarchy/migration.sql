-- Add a self-referential foreign key (recursive key) on Category so a category
-- can have an optional parent category. This turns the flat list into a tree.
--   * parentCode is nullable: roots have NULL.
--   * The FK references Category.code on the SAME table.
--   * ON DELETE SET NULL: deleting a parent does not delete its children;
--     the children just become roots. CASCADE is also a valid choice
--     ("delete the whole subtree") - choose based on your domain rules.
--   * Index on parentCode supports queries like "find children of X".
--
-- SQLite cannot ALTER TABLE to add a foreign key, so we recreate the table
-- and copy data over.

PRAGMA foreign_keys=OFF;

CREATE TABLE "Category_new" (
    "code"       TEXT NOT NULL PRIMARY KEY,
    "name"       TEXT NOT NULL,
    "parentCode" TEXT,
    "createdAt"  TEXT NOT NULL,
    "updatedAt"  TEXT NOT NULL,
    CONSTRAINT "Category_parentCode_fkey" FOREIGN KEY ("parentCode") REFERENCES "Category" ("code") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "Category_new" ("code", "name", "parentCode", "createdAt", "updatedAt")
SELECT "code", "name", NULL, "createdAt", "updatedAt"
FROM "Category";

DROP TABLE "Category";
ALTER TABLE "Category_new" RENAME TO "Category";

CREATE INDEX "Category_parentCode_idx" ON "Category"("parentCode");

PRAGMA foreign_keys=ON;
