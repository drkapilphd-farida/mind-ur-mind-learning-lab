# Mind Ur Mind Learning Lab™ — Claude Code Context

## What this project is
Enterprise SaaS EdTech platform. AI-powered learning with courses, lessons, progress tracking, and subscription billing.

## Engineering Constitution
`ENGINEERING_CONSTITUTION.md` in this directory is the authoritative standard for all engineering decisions. Read it before writing any code. It governs:
- Folder structure and file naming
- TypeScript, React, Next.js App Router patterns
- Supabase integration (client variants, RLS, migrations)
- AI integration (Anthropic Claude, server-side only)
- Security, performance, and scalability standards

## Tech Stack
- **Framework:** Next.js (App Router)
- **Language:** TypeScript (strict mode, all flags enabled)
- **UI:** React + Tailwind CSS + shadcn/ui
- **Database/Auth:** Supabase (Postgres + RLS + Auth + Storage + Realtime)
- **AI:** Anthropic Claude (`@anthropic-ai/sdk`) — server-side only
- **Billing:** Stripe
- **State:** TanStack Query (server state) + Zustand (global UI) + nuqs (URL state)
- **Forms:** React Hook Form + Zod
- **Testing:** Playwright (e2e) + Vitest (unit/integration)

## Critical Rules (abbreviated — full rules in ENGINEERING_CONSTITUTION.md)
- No `any` in TypeScript
- Default to Server Components; push `'use client'` as deep as possible
- All mutations via Server Actions, never client-to-own-API-route
- All inputs validated with Zod at the boundary
- RLS is mandatory on all user-data tables
- Anthropic API key is server-only — never expose to client
- No `console.log` in production code — use structured logger
- No PII in logs
- Commits follow Conventional Commits spec
- Branches follow `<type>/<ticket-id>-<short-description>` pattern
