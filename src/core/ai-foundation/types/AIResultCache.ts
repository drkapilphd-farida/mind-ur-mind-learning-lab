import type { AIResponse, AIUsage } from '@/features/ai-provider/types'

// AI Foundation Layer™ — AIF-1. "AI must process uploaded content only
// once... never repeat an identical AI request." Keyed by a deterministic
// hash of (task, payload) — see internal/computeCacheKey.ts — so the
// same content processed for the same task always hits the same entry,
// and a different task over the same content never collides with it.
export type AIResultCacheEntry = {
  response: AIResponse
  usage: AIUsage
  cachedAt: string
}

// The default implementation (internal/InMemoryAIResultCache.ts) is a
// real, TTL-aware, in-process Map — a real, scoped limitation this
// sprint (see the architecture doc): it only dedupes within one running
// process, not across server instances or restarts. This interface is
// the seam a future SupabaseAIResultCache/Redis-backed implementation
// plugs into without changing aiFoundation.ts.
export interface AIResultCache {
  get(key: string): Promise<AIResultCacheEntry | undefined>
  set(key: string, entry: AIResultCacheEntry, ttlSeconds?: number): Promise<void>
}
