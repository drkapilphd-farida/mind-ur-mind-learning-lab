import type { AIResultCache, AIResultCacheEntry } from '../types/AIResultCache'

type StoredEntry = {
  entry: AIResultCacheEntry
  expiresAt: number | null
}

export type InMemoryAIResultCacheOptions = {
  now?: () => Date
  // Applied when `set()` is called without its own `ttlSeconds` —
  // `undefined` (the default) means "never expires."
  defaultTtlSeconds?: number
}

// AI Foundation Layer™ — AIF-1. Real, TTL-aware, in-process cache — the
// default AIResultCache implementation. Scoped limitation, disclosed in
// the architecture doc: dedupes within one running process only, not
// across server instances or restarts. Expired entries are evicted
// lazily on read (checked against an injectable clock, matching this
// codebase's established `options.now` DI convention), not on a
// background timer — no setInterval running for the lifetime of the
// process.
export class InMemoryAIResultCache implements AIResultCache {
  private readonly store = new Map<string, StoredEntry>()
  private readonly now: () => Date
  private readonly defaultTtlSeconds: number | undefined

  constructor(options: InMemoryAIResultCacheOptions = {}) {
    this.now = options.now ?? (() => new Date())
    this.defaultTtlSeconds = options.defaultTtlSeconds
  }

  async get(key: string): Promise<AIResultCacheEntry | undefined> {
    const stored = this.store.get(key)
    if (!stored) return undefined

    if (stored.expiresAt !== null && stored.expiresAt <= this.now().getTime()) {
      this.store.delete(key)
      return undefined
    }

    return stored.entry
  }

  async set(key: string, entry: AIResultCacheEntry, ttlSeconds?: number): Promise<void> {
    const effectiveTtlSeconds = ttlSeconds ?? this.defaultTtlSeconds
    const expiresAt = effectiveTtlSeconds !== undefined ? this.now().getTime() + effectiveTtlSeconds * 1000 : null
    this.store.set(key, { entry, expiresAt })
  }
}

export function createInMemoryAIResultCache(options: InMemoryAIResultCacheOptions = {}): AIResultCache {
  return new InMemoryAIResultCache(options)
}
