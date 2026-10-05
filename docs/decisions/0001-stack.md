# 0001. TypeScript monorepo on Supabase, Cloudflare Pages and Expo

- Status: accepted
- Date: 2026-10-05

## Context

Woodworks needs a web app and a mobile app, must be cheap and easy to host,
and is a multi-tenant SaaS. It is built by a small team.

## Decision

- One TypeScript monorepo (pnpm + Turborepo) so web, mobile and shared logic
  share types and code.
- Supabase for Postgres, auth and file storage; tenancy enforced with Row Level
  Security instead of a custom API layer.
- Web: React + Vite, installable as a PWA, hosted on Cloudflare Pages.
- Mobile: Expo.

## Consequences

- About €0/month to start; Supabase Pro (~$25/month) is the first real cost.
- Business logic that must be trusted runs in Postgres (policies, constraints,
  functions) or Supabase Edge Functions, not in the clients.
- Alternative kept in mind: all-Cloudflare (Workers + D1 + R2) if costs grow.
