# Architecture overview

```
apps/web     React + Vite, PWA        ─┐
apps/mobile  Expo (React Native)      ─┤── packages/core      domain types, units
                                       ├── packages/geometry  3D transform stack
                                       └── Supabase: Auth, Postgres (RLS), Storage
supabase/    database migrations
docs/        product, architecture, decisions
```

## Monorepo

pnpm workspaces + Turborepo. Shared packages are plain TypeScript source
(`exports` points at `src/index.ts`); Vite and Metro compile them directly, so
there is no package build step. `.npmrc` uses `node-linker=hoisted` because
React Native's tooling expects a flat `node_modules`.

Adding something new:

- **A new app** (e.g. a docs site or an admin panel): `apps/<name>` with a
  `package.json` named `@woodworks/<name>` and the scripts it supports
  (`dev`, `build`, `lint`, `typecheck`, `test`). Turborepo picks it up.
- **A new shared package:** `packages/<name>`, same pattern as
  `packages/core`. Add it as `"@woodworks/<name>": "workspace:*"` where used.

## Data and tenancy

One shared Postgres database. Every tenant row has a `workspace_id`; Row Level
Security only lets members of that workspace read or write it
(`public.is_member`). A workspace can be one person, a household, a club or a
school. See [the initial migration](../../supabase/migrations/20261005000000_init.sql).

Key tables: `projects`, `parts`, `drawings` (3D model + `transform_steps`),
`materials`, `assets`, `contacts` (registered users or typed-in names),
`loans`, `availability_windows` (recurring weekly slots) and `bookings`
(an exclusion constraint prevents double booking a machine).

## Hosting

- Web: Cloudflare Pages (free tier allows commercial use).
- Backend: Supabase, EU region (free tier to start).
- Mobile: Expo EAS builds; App Store and Play Store accounts needed to publish.
