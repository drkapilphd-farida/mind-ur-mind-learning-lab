import type { UniversalLearningObject } from '../types/UniversalLearningObject'

// Universal Learning Object™ (UCE-6). "The ULO is generated once. Every
// Learning Mode must reuse the same ULO." Real in-memory cache, keyed by
// `documentId` — the same get/set shape as AIF-1's own
// `InMemoryAIResultCache`, synchronous here (not `Promise`-returning)
// since a plain in-memory `Map` has no real I/O to await, an honest
// simplification rather than copying AIF-1's async signature
// unnecessarily. Scoped limitation, disclosed like every other in-memory
// cache in this arc: dedupes within one running process only, not
// across server instances or restarts — a future persistent
// implementation (e.g. Supabase-table-backed) would satisfy the same
// interface without changing any caller.
export interface UniversalLearningObjectCache {
  get(documentId: string): UniversalLearningObject | undefined
  set(documentId: string, ulo: UniversalLearningObject): void
}

class InMemoryUniversalLearningObjectCache implements UniversalLearningObjectCache {
  private readonly store = new Map<string, UniversalLearningObject>()

  get(documentId: string): UniversalLearningObject | undefined {
    return this.store.get(documentId)
  }

  set(documentId: string, ulo: UniversalLearningObject): void {
    this.store.set(documentId, ulo)
  }
}

export function createUniversalLearningObjectCache(): UniversalLearningObjectCache {
  return new InMemoryUniversalLearningObjectCache()
}
