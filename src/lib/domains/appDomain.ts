import { headers } from 'next/headers'

// Domain Split™ — habit.mindurmind.org.in (the 21-Day Habit Builder,
// nothing else) vs. app.mindurmind.org.in (QSR Masterclass, Upload &
// Learn, Parent Dashboard). One Next.js deployment serves both; the real
// signal is the request's own Host header, resolved once in
// src/middleware.ts and forwarded to Server Components via the
// APP_DOMAIN_HEADER request header (see middleware.ts's own comment on
// why that's a header, not a mutated request object).
//
// Matching on the first DNS label needs no env var: it resolves
// `habit.mindurmind.org.in` in production and `habit.localhost:3000` in
// local dev (browsers/OSes resolve `*.localhost` to loopback
// automatically, no /etc/hosts edit needed) to 'habit' alike; every other
// host — `app.mindurmind.org.in`, plain `localhost:3000`, any preview
// deployment URL — safely defaults to 'app'.
export type AppDomain = 'habit' | 'app'

export const APP_DOMAIN_HEADER = 'x-app-domain'

export function resolveAppDomain(host: string | null): AppDomain {
  if (!host) return 'app'
  const firstLabel = host.split(':')[0]?.split('.')[0]
  return firstLabel === 'habit' ? 'habit' : 'app'
}

// App Subdomain Check™ — a narrower, separate question from
// resolveAppDomain() above: "is this literally the app.* host?", not
// "should this request get the flagship dashboard content?". The two
// used to be the same question (resolveAppDomain's own 'app' bucket
// deliberately also covers the bare root/apex marketing domain, plain
// localhost, and preview deployment URLs — that grouping stays correct
// and unchanged for dashboard-content purposes, e.g. which
// HabitDashboard/QsrDashboard renders). This function exists only for
// src/middleware.ts's root-path ('/') redirect, which DOES need to tell
// the real app.mindurmind.org.in subdomain apart from the marketing
// apex — see that call site for why.
export function isAppSubdomain(host: string | null): boolean {
  if (!host) return false
  const firstLabel = host.split(':')[0]?.split('.')[0]
  return firstLabel === 'app'
}

// Server-only — reads the header middleware forwards. Call from a Server
// Component/layout, never from a Client Component (use a passed-down
// prop there instead, see AppSidebar.tsx/Topbar.tsx/NavLinks.tsx).
//
// `headers()` is imported statically at module scope (not via a runtime
// `await import(...)`) deliberately — Next.js decides whether a route can
// be cached/statically rendered via static analysis of dynamic-API usage,
// and a dynamic import defeats that analysis, silently letting a route
// that actually depends on the real per-request Host header get served
// from a stale cached render instead (confirmed live: a dynamic import
// here caused habit.mindurmind.org.in to render app.mindurmind.org.in's
// cached dashboard). A static import is what makes `headers()`'s own
// "opts this route out of static rendering" behavior actually apply.
export async function getAppDomain(): Promise<AppDomain> {
  const value = (await headers()).get(APP_DOMAIN_HEADER)
  return value === 'habit' ? 'habit' : 'app'
}

// Server-only — the real absolute origin the current request actually
// arrived on (e.g. `https://habit.mindurmind.org.in`), for building the
// absolute redirect URLs Supabase auth requires (resetPasswordForEmail's
// `redirectTo`, signUp's `emailRedirectTo`) — never a static env var like
// NEXT_PUBLIC_APP_URL, which points at one fixed domain and would bounce
// every such link to that domain regardless of which one the user
// actually started on. Mirrors what src/app/auth/callback/route.ts
// already does correctly via `new URL(request.url).origin`; Server
// Actions don't receive a Request object, so this reads the same
// information from headers() instead.
export async function getRequestOrigin(): Promise<string> {
  const allHeaders = await headers()
  const host = allHeaders.get('x-forwarded-host') ?? allHeaders.get('host') ?? 'localhost:3000'
  const protocol = allHeaders.get('x-forwarded-proto') ?? (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https')
  return `${protocol}://${host}`
}
