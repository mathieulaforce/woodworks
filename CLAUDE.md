# Woodworks

pnpm + Turborepo monorepo. Read `docs/README.md` and `docs/architecture/overview.md` first.

- Run `pnpm lint && pnpm typecheck && pnpm test && pnpm build` from the root before pushing.
- Lengths are stored in millimetres everywhere; convert only for input and display (`@woodworks/core` units).
- Shared packages are source-only TypeScript (no build step). Use extensionless relative imports so Metro and Vite both resolve them.
- Mobile: follow `apps/mobile/AGENTS.md`; add Expo packages with `npx expo install`.
- Database changes are new files in `supabase/migrations/`; every tenant table needs `workspace_id` and RLS.
- Keep `packages/core/src/domain.ts` in sync with the migrations.
- Record significant decisions as a new ADR in `docs/decisions/`.
