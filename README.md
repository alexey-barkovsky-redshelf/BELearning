# BELearning

Ecommerce monorepo: **Express** (API) + **React** (web), TypeScript, Yarn workspaces.

## Structure

```
apps/
  api/     — Express API (MVC + repository pattern)
  web/     — React + Vite frontend
packages/
  shared/  — Shared types and interfaces (@belearning/shared)
  utils/   — Constants and utilities (@belearning/utils)
```

### API

- **Domain** — User, Product, Order, OrderItem. Value objects: Slug, Money, Email.
- **Repositories** — IProductRepository, IOrderRepository (+ in-memory). Seed at startup: `seed/mockData.ts`.
- **Services** — ProductService, OrderService, HealthService.
- **Flow** — Route → Controller → Service → Repository → Domain.

## API endpoints

| Path | Description |
|------|-------------|
| `GET /health` | Health check |
| `GET/POST /products`, `GET /products/:id`, `GET /products/slug/:slug` | Products |
| `POST /orders`, `GET /orders/:id`, `GET /orders/user/:userId`, `POST /orders/:id/paid` | Orders |

## Setup

```bash
yarn install
cp apps/api/.env.template apps/api/.env
yarn workspace @belearning/shared build
yarn workspace @belearning/utils build
yarn db:generate
yarn db:migrate
yarn db:seed
```

If `yarn db:migrate` cannot apply migrations from an empty database (older migration chain), recreate the SQLite file from the current schema and seed:

```bash
rm -f apps/api/prisma/dev.db
yarn db:push
yarn db:seed
```

## Run locally

```bash
yarn dev:api   # http://localhost:3000
yarn dev:web   # http://localhost:5173 — proxies /api to the API
```

## Demo accounts (seeded)

Sign in with **email + password** (see the Log in page in the web app). These users are created by `yarn db:seed` (and on API startup when seeding is enabled).

| Email | Password | Role |
|-------|----------|------|
| `demo@seed.local` | `demo` | user |
| `admin@seed.local` | `admin` | admin |

## Scripts

| Command | Description |
|--------|-------------|
| `yarn dev:api` | API (http://localhost:3000) |
| `yarn dev:web` | Web (http://localhost:5173) |
| `yarn db:push` | `prisma db push` in API (sync schema to SQLite without migrations) |
| `yarn build` | Build all |
| `yarn lint` | Lint |
| `yarn test:api` | API Jest tests (includes JWT secret, `requireAuth` / `requireRole`, `AuthService`) |

Web proxies `/api` to the API (`apps/web/vite.config.ts`).

**Web UI** — Products, cart, checkout (JWT auth), orders, admin panel for **`admin@seed.local`**. Run `yarn dev:web` and open http://localhost:5173.
