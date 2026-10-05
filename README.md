# Woodworks

Design, plan and build woodworking and furniture projects. For hobbyists who
want to take it to the next level.

- **Web** (`apps/web`): preparation, design, detailed status, photos. Installable on a phone.
- **Mobile** (`apps/mobile`, Expo): in the shop. Measurements, todo list, shopping list.

## Getting started

Requires Node 22 and pnpm (`corepack enable`).

```bash
pnpm install
pnpm dev:web      # web app on http://localhost:5173
pnpm dev:mobile   # Expo dev server, open with Expo Go
```

Checks, run from the root for every app and package:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Layout

```
apps/        runnable apps (web, mobile, more later)
packages/    shared code (core domain types and units, geometry)
supabase/    database migrations
docs/        product, architecture and decision records
```

Start with [docs/README.md](docs/README.md).
