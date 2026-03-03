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
yarn workspace @belearning/shared build
yarn workspace @belearning/utils build
```

## Scripts

| Command | Description |
|--------|-------------|
| `yarn dev:api` | API (http://localhost:3000) |
| `yarn dev:web` | Web (http://localhost:5173) |
| `yarn build` | Build all |
| `yarn lint` | Lint |

Web proxies `/api` to the API (`apps/web/vite.config.ts`).

**Web UI** — Products list and detail, create order (with User ID + cart), list orders and mark paid. Run `yarn dev:web` and open http://localhost:5173. Use any User ID (e.g. `user-1`) for Orders.
