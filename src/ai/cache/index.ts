// Future AI response cache — the contract only. No backend (Redis,
// Supabase, in-memory) chosen yet; that's a real infra decision for
// whichever future sprint needs response caching, not this foundation.

export type AICache = {
  get: (key: string) => Promise<string | undefined>
  set: (key: string, value: string, ttlSeconds?: number) => Promise<void>
}

// A no-op cache — always misses, never stores. Safe default so callers
// can depend on `AICache` today without a real cache existing yet.
export const noopCache: AICache = {
  async get() {
    return undefined
  },
  async set() {
    // Intentionally a no-op.
  },
}
