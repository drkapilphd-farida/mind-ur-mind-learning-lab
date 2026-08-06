import { headers } from 'next/headers'

type RateLimitOptions = {
  max: number
  windowMs: number
}

type RateLimitResult = { allowed: true } | { allowed: false; retryAfterMs: number }

type WindowEntry = { count: number; resetAt: number }

// Plain request-count limiting for non-AI call sites (a webhook, an auth
// action) — deliberately separate from AI Foundation's own RateLimiter
// (src/core/ai-foundation), which is token-aware and per-user by design.
// This one only ever counts requests against an arbitrary string key
// (an IP, or "action:IP"), which is what a not-yet-authenticated caller
// (no user id to key by) or an external webhook caller actually needs.
//
// In-memory, fixed-window, held in a module-level Map for this server
// process's lifetime — the same disclosed tradeoff as every other
// in-memory limiter in this codebase: resets on deploy/cold start, and
// on Vercel's serverless model isn't shared across concurrent function
// instances, so it's a real but not absolute deterrent. Good enough for
// "slow down abuse," not a substitute for a distributed limiter (Upstash
// Redis or similar) if this app later needs a hard, cross-instance
// guarantee.
const windows = new Map<string, WindowEntry>()

// Swept on a fraction of calls rather than a running timer — avoids any
// setInterval lifecycle/shutdown concerns in a serverless environment,
// while still keeping the map from growing unboundedly across many
// distinct keys over a long-lived process.
const SWEEP_PROBABILITY = 0.01

function sweepExpired(nowMs: number): void {
  for (const [key, entry] of windows) {
    if (entry.resetAt <= nowMs) {
      windows.delete(key)
    }
  }
}

export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const nowMs = Date.now()

  if (Math.random() < SWEEP_PROBABILITY) {
    sweepExpired(nowMs)
  }

  const existing = windows.get(key)

  if (existing === undefined || existing.resetAt <= nowMs) {
    windows.set(key, { count: 1, resetAt: nowMs + options.windowMs })
    return { allowed: true }
  }

  if (existing.count >= options.max) {
    return { allowed: false, retryAfterMs: existing.resetAt - nowMs }
  }

  existing.count += 1
  return { allowed: true }
}

// Vercel (and most reverse proxies) set x-forwarded-for to
// "client, proxy1, proxy2" — the first entry is the original client.
// Falls back to x-real-ip, then a constant — the constant means every
// caller with neither header (plain local dev, no proxy in front) shares
// one bucket, which only matters for local testing, never in production
// behind Vercel's own proxy.
export async function getClientIp(): Promise<string> {
  const headersList = await headers()
  const forwardedFor = headersList.get('x-forwarded-for')
  if (forwardedFor !== null) {
    const first = forwardedFor.split(',')[0]?.trim()
    if (first !== undefined && first !== '') return first
  }
  const realIp = headersList.get('x-real-ip')
  if (realIp !== null && realIp !== '') return realIp
  return 'unknown'
}
