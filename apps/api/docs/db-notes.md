# BELearning DB notes

Single reference for the schema's keys, relations, indexes, normal forms, and SQL-injection prevention. Pair this with `apps/api/prisma/schema.prisma` and the migrations folder.

## Tables and primary keys

| Table              | Primary key                       | Type           | Why this style |
|--------------------|-----------------------------------|----------------|----------------|
| `User`             | `id` (UUID)                       | surrogate      | opaque, stable, no business meaning |
| `Product`          | `id` (UUID)                       | surrogate      | likewise; product names/slugs may change |
| `Category`         | `code` (String)                   | natural        | small enum-like value, human-readable, used in URLs |
| `ProductCategory`  | `(productId, code)`               | composite      | natural identity of a join row; prevents duplicate links |
| `Promotion`        | `id` (UUID)                       | surrogate      | independent campaigns, not identified by a natural key |
| `PromotionProduct` | `(promotionId, productId)`        | composite      | natural identity of a link; payload column allowed |
| `Order`            | `id` (UUID)                       | surrogate      | likewise |
| `OrderItem`        | `id` (UUID)                       | surrogate      | could be `(orderId, productId)`; see "deliberately skipped" below |

### Recursive (self-referential) key
`Category.parentCode` references `Category.code`. Optional (nullable) so a row can be a root.

```
parent       Category? @relation("CategoryHierarchy", fields: [parentCode], references: [code], onDelete: SetNull)
children     Category[] @relation("CategoryHierarchy")
```

`onDelete: SetNull` is a real design call: deleting a parent floats children up to roots. `Cascade` would delete the whole subtree.

## Foreign keys (with `onDelete` choice)

| Source                                  | References          | onDelete | Reasoning |
|-----------------------------------------|---------------------|----------|-----------|
| `ProductCategory.productId`             | `Product.id`        | Cascade  | links die with the product |
| `ProductCategory.code`                  | `Category.code`     | Cascade  | links die with the category |
| `Category.parentCode`                   | `Category.code`     | SetNull  | children become roots |
| `PromotionProduct.promotionId`          | `Promotion.id`      | Cascade  | links die with the campaign |
| `PromotionProduct.productId`            | `Product.id`        | Cascade  | could also be `Restrict` (don't silently drop links) |
| `OrderItem.orderId`                     | `Order.id`          | Cascade  | items belong to the order |

`OrderItem.productId` is intentionally **not** a foreign key. Order items are a historical record - if a product is deleted, the order must remain intact. See "deliberate denormalizations" below.

## Indexes (and why each one exists)

| Table             | Index                              | Purpose / supported query |
|-------------------|------------------------------------|---------------------------|
| `User`            | `email` UNIQUE                      | login lookup |
| `Product`         | `slug` UNIQUE                       | URL lookup (`/products/slug/:slug`) |
| `Product`         | `name`                              | search and sort by name |
| `Product`         | `price`                             | range filters (`minPrice`/`maxPrice`) |
| `Product`         | `createdAt`                         | sort by recency |
| `ProductCategory` | `(productId, code)` PK              | "categories of product X" |
| `ProductCategory` | `code`                              | "products in category X" (PK leftmost is `productId`) |
| `Category`        | `code` PK                           | direct fetch by code |
| `Category`        | `parentCode`                        | "children of X" |
| `Promotion`       | `(validFrom, validTo)`              | "active today" range filter |
| `Promotion`       | `isActive`                          | filter the active flag |
| `PromotionProduct`| `(promotionId, productId)` PK       | "products of promotion X" |
| `PromotionProduct`| `productId`                         | "promotions of product X" (PK leftmost is `promotionId`) |
| `Order`           | `userId`                            | `/orders/me`, admin "by user" |
| `Order`           | `(status, createdAt)`               | "list paid orders newest first" |
| `OrderItem`       | `orderId`                           | JOIN from `Order` (SQLite does not auto-index FKs) |
| `OrderItem`       | `productId`                         | analytics: top-selling products, "orders containing product X" |

### Index rules of thumb
- Every `@unique` already creates a backing index. Don't duplicate it with `@@index`.
- A composite key/index serves queries that filter by its **leftmost** columns. `(a, b)` helps `WHERE a = ?` and `WHERE a = ? AND b = ?`, but not `WHERE b = ?` on its own.
- Indexes cost disk and slow down writes (one extra B-tree update per row). Don't add speculatively - add when you can name the query the index serves.
- Postgres auto-creates an index for unique constraints. SQLite does the same for `UNIQUE` and primary keys, but **not** for FK columns - that's why we add `OrderItem(orderId)` explicitly.

## Normal forms

The schema is in 3NF.

### 1NF - atomic columns
Each cell holds a single value, no arrays embedded as JSON, no comma-separated lists. The earlier `Product.categories: ProductCategoryCode[]` was a 1NF violation; it was normalized into the `ProductCategory` join table in migration `20260331120000_normalize_product_categories`.

### 2NF - non-key columns depend on the *whole* primary key
- The composite-PK join tables (`ProductCategory`, `PromotionProduct`) only carry payload that depends on **both** key columns. `PromotionProduct.discountPctOverride` is per-(promotion, product), not per-promotion or per-product alone. 2NF holds.
- For surrogate-PK tables (`User`, `Product`, `Order`, etc.), 2NF is trivially satisfied because the PK is a single column.

### 3NF - no transitive dependencies on the PK
- `Order` does not store `userEmail`, `userRole`, etc. Those depend on `userId`, not on `Order.id`. To get the email we resolve through `User`.
- `Promotion` does not store a derived `isCurrentlyActive` boolean. That can be computed from `(validFrom, validTo, isActive)` and would otherwise have to be kept in sync.
- `Product` does not store an aggregate like `totalSold`. That's a query, not state.

### Deliberate denormalizations (NOT 3NF violations - audit/historical needs)
- `OrderItem.productTitle` and `OrderItem.priceAtPurchase` duplicate fields from `Product`. An order is a *historical record*; the title and unit price at the moment of purchase must remain immutable even if the product is renamed, repriced, or deleted. These columns reflect the **value at order time**, not a derived attribute of the order key, so this is a valid trade-off, not a 3NF violation.
- `Order.currency` is also a denormalized snapshot of the user's currency choice at order time, for the same reason.

## SQL injection prevention with Prisma

Prisma's typed query API (`findMany`, `groupBy`, `aggregate`, ...) is parameterized by construction and is always safe.

For raw SQL there are two methods:

| Method                              | Safe?                                                | When to use |
|-------------------------------------|------------------------------------------------------|-------------|
| `prisma.$queryRaw\`SQL with ${x}\`` | yes - `Prisma.sql` template tag binds `${x}` as a parameter | almost always |
| `prisma.$queryRawUnsafe(\`SQL...\`)` | no by default - the whole string is sent verbatim    | only when *SQL itself* must be dynamic (e.g. an `ORDER BY` column name) and the inputs are validated against an allow-list |

### Safe (used in this project)

`apps/api/src/modules/analytics/Services/analyticsService.ts`:

```ts
const rows = await prisma.$queryRaw<Row[]>(Prisma.sql`
  ...
  WHERE o."createdAt" >= ${params.since}
    AND o."createdAt" <  ${params.until}
  ...
`);
```

Even if `params.since` were `2026-01-01' OR 1=1 --`, the engine would compare `o.createdAt` against the entire string as a literal value. The injection attempt cannot break out of the value position because it is sent as a parameter, not as part of the SQL text.

### Unsafe equivalent - never do this

```ts
// DO NOT. Vulnerable to SQL injection.
await prisma.$queryRawUnsafe(`
  ... WHERE o."createdAt" >= '${params.since}' ...
`);
```

If `params.since` came from a query string and a user submitted `2026-01-01' OR 1=1 --`, the resulting SQL would be:

```sql
... WHERE o."createdAt" >= '2026-01-01' OR 1=1 --' ...
```

`OR 1=1` makes the predicate always true, the `--` comments out the rest. Bypass complete.

### When you really need a dynamic SQL identifier

If you need to vary an ORDER BY column or a table name (which can't be parameterized), validate against a hard-coded allow-list before interpolation:

```ts
const ALLOWED = new Set(['createdAt', 'price', 'name']);
if (!ALLOWED.has(sortBy)) {
  throw new Error('invalid sortBy');
}
const sql = Prisma.sql`SELECT * FROM "Product" ORDER BY ${Prisma.raw(sortBy)} ASC`;
```

`Prisma.raw` opts out of parameterization for that fragment - the allow-list is what makes this safe.

## Deliberately skipped (open follow-ups)

- **Composite PK on `OrderItem(orderId, productId)`**: would prevent the same product from appearing as two separate lines in one order. The cart already de-dupes on `productId`, so it's compatible in practice, but it is a behavior change worth flagging - kept as a UUID PK for now.
