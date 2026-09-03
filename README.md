# Quantum Mind Learning Lab™

Enterprise SaaS EdTech platform. AI-powered learning with courses, lessons, progress tracking, and subscription billing.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 (strict + 5 extra flags) |
| UI | React 19 + Tailwind CSS v4 + shadcn/ui |
| Database & Auth | Supabase (Postgres + RLS + Auth) |
| AI | Anthropic Claude (`claude-sonnet-4-6`) |
| Billing | Stripe |
| Testing | Playwright (E2E) + Vitest (unit) |

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- A [Stripe](https://stripe.com) account (for paid courses)
- An [Anthropic](https://anthropic.com) API key (for AI tutor + content generation)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

Required variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Admin access (comma-separated email addresses)
ADMIN_EMAILS=admin@yourdomain.com
```

### 3. Run database migrations

```bash
npx supabase db push
```

All migrations live in `supabase/migrations/`.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Development

### Project structure

```
src/
├── app/                    # Next.js App Router routes
│   ├── (admin)/            # Admin panel (auth-guarded by ADMIN_EMAILS)
│   ├── (auth)/             # Login, signup, password reset
│   ├── (dashboard)/        # Student dashboard (auth-guarded)
│   ├── (marketing)/        # Public pages (homepage, catalog, lessons)
│   ├── api/                # Route handlers (Stripe webhook, health)
│   └── auth/callback/      # PKCE OAuth callback
├── components/             # Shared UI components
├── features/               # Feature-oriented business logic
│   ├── admin/              # Admin actions & components
│   ├── auth/               # Auth actions, forms, types
│   ├── billing/            # Stripe checkout
│   ├── certificates/       # Certificate claim & display
│   ├── courses/            # Course catalog & lesson components
│   └── user/               # Profile & password management
└── lib/
    ├── ai/                 # Anthropic client (server-only)
    ├── supabase/           # Browser, server, service, middleware clients
    └── logger.ts           # Structured JSON logger
```

### Engineering standards

All engineering decisions are governed by `ENGINEERING_CONSTITUTION.md`. Key rules:

- No `any` in TypeScript
- Default to Server Components; use `'use client'` only when needed
- All mutations via Server Actions (never client → own API route)
- All inputs validated with Zod at the boundary
- RLS is mandatory on all user-data tables
- `ANTHROPIC_API_KEY` is server-only — never exposed to the client
- No `console.log` in production code — use the structured logger

### Supabase clients

Three client variants — use the right one for the context:

| File | When to use |
|---|---|
| `src/lib/supabase/server.ts` | Server Components, Server Actions, Route Handlers |
| `src/lib/supabase/browser.ts` | Client Components (auth state only) |
| `src/lib/supabase/service.ts` | Bypasses RLS (admin webhooks, sitemap) |
| `src/lib/supabase/middleware.ts` | `src/middleware.ts` only |

## Testing

### Unit tests (Vitest)

```bash
npm run test:unit        # run once
npm run test:unit:watch  # watch mode
```

Tests live alongside source files as `*.test.ts`. They cover pure utility functions and Zod schema validation.

### End-to-end tests (Playwright)

Requires a running dev server and test environment variables:

```env
E2E_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
```

```bash
npm run test:e2e        # headless
npm run test:e2e:ui     # Playwright UI
```

## Admin access

Set `ADMIN_EMAILS` to a comma-separated list of email addresses that should have admin access. Admins can:

- Create, edit, publish, and delete courses and lessons
- Generate AI lesson content with one click
- View platform metrics (enrollments, revenue, completion rates)

## Stripe webhook

In development, forward Stripe events to the local webhook handler:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

The webhook secret (`STRIPE_WEBHOOK_SECRET`) must match the one shown by the Stripe CLI or your Stripe dashboard webhook configuration.

## Deployment

The app is designed for deployment on Vercel:

1. Connect the repository to a Vercel project
2. Add all environment variables in the Vercel dashboard
3. Configure the Stripe webhook URL to point at `https://your-domain.com/api/stripe/webhook`
4. Run `npx supabase db push` against your production Supabase project

Ensure `NEXT_PUBLIC_APP_URL` is set to your production domain — it is used for email redirect URLs and the sitemap.

<!-- deploy-trigger-check: verifying Vercel auto-deploy fires after Git integration reconnect -->
