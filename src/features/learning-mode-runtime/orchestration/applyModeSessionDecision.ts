import type { AdaptiveRuntimeState, RuntimeActionResult } from '@/core/adaptive-learning-runtime'
import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import type { SessionSnapshot } from '@/core/learning-session-runtime'
import type { LearningMode } from '@/core/learning-mode-integration'
import { restoreFromSnapshot, buildSessionSnapshot } from '@/core/learning-session-runtime'
import { dispatchAfterDecision } from '@/core/learning-mode-integration'
import type { RuntimeActionError } from '@/core/adaptive-learning-runtime'

// Shared Learning Runtime — Memory Mode™ Sprint-1 shared-extraction.
// Moved and renamed from Quantum Speed Reading™'s own
// `orchestration/applyReadingSessionDecision.ts` (Sprint-1) — already
// fully mode-agnostic (took `mode: LearningMode` as an explicit parameter
// from day one). Restore-from-snapshot → apply one real LSE-2 decision →
// dispatch to the mode's optional adapter → re-derive the next real
// snapshot. No new session engine, no new restore mechanism — this is
// pure composition of LSE-2/LSE-3/LSE-4's own public surfaces.
export type ModeSessionDecisionOutcome = { success: true; snapshot: SessionSnapshot; runtime: AdaptiveRuntimeState } | { success: false; error: RuntimeActionError }

export function applyModeSessionDecision(
  mode: LearningMode,
  snapshot: SessionSnapshot,
  ulo: UniversalLearningObject,
  decide: (runtime: AdaptiveRuntimeState, ulo: UniversalLearningObject) => RuntimeActionResult,
): ModeSessionDecisionOutcome {
  const restored = restoreFromSnapshot(snapshot, ulo)
  if (!restored.success) return { success: false, error: restored.error }

  const result = dispatchAfterDecision(mode, ulo, decide(restored.state, ulo))
  if (!result.success) return { success: false, error: result.error }

  // ALS-15 — `method` (Memory Mode™'s six real Memory Methods) has no
  // representation in `AdaptiveRuntimeState`, so `buildSessionSnapshot`
  // can't derive it from `result.state` the way it derives `strategy`.
  // Carried forward from the incoming snapshot instead — the same value
  // survives every decision this function applies, exactly how `strategy`
  // survives via `restoreFromSnapshot` one layer down.
  return { success: true, snapshot: { ...buildSessionSnapshot(result.state), method: snapshot.method }, runtime: result.state }
}
