import type { AdaptiveRuntimeState } from '@/core/adaptive-learning-runtime'
import type { SessionSnapshot } from './types/SessionSnapshot'
import { computeRuntimeMetrics } from './computeRuntimeMetrics'

// Learning Session Runtime™ (LSE-3). Session Persistence. Pure. The ONE
// shared implementation of "what a Learning Mode should actually persist" —
// a real, derived, bounded projection of `AdaptiveRuntimeState`. Every field
// is read from real runtime/session state or computed via the one shared
// `computeRuntimeMetrics` — the raw `eventLog` is deliberately never
// included (see types/SessionSnapshot.ts).
export function buildSessionSnapshot(runtime: AdaptiveRuntimeState, options: { now?: () => Date } = {}): SessionSnapshot {
  const now = options.now ?? (() => new Date())

  return {
    runtimeId: runtime.id,
    sessionId: runtime.session.id,
    learnerId: runtime.session.learnerId,
    documentId: runtime.session.documentId,
    uloId: runtime.session.uloId,
    uloVersion: runtime.session.uloVersion,
    sessionType: runtime.session.sessionType,
    strategy: runtime.strategy,
    // ALS-15 — `AdaptiveRuntimeState` (LSE-2) deliberately has no concept
    // of `method`; it never affects chunk scheduling/ordering, so it was
    // never added there. Every caller that cares (today, only Memory
    // Mode™) overrides this default explicitly — see
    // `applyModeSessionDecision.ts` for the carry-forward and
    // `startMemorySession.ts` for the initial value.
    method: null,
    status: runtime.session.status,
    completedChunkIds: runtime.progress.completedChunkIds,
    skippedChunkIds: runtime.skippedChunkIds,
    revisitChunkIds: runtime.revisitChunkIds,
    repeatCounts: runtime.repeatCounts,
    completionPercentage: runtime.progress.completionPercentage,
    metrics: computeRuntimeMetrics(runtime),
    startedAt: runtime.session.startedAt,
    completedAt: runtime.session.completedAt,
    capturedAt: now().toISOString(),
  }
}
