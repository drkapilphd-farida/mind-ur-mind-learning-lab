import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import type { AdaptiveRuntimeState, RuntimeActionOptions, RuntimeActionResult } from '@/core/adaptive-learning-runtime'
import { startRuntime } from '@/core/adaptive-learning-runtime'
import { diagnoseRuntimeHealth } from '../diagnoseRuntimeHealth'

// Learning Session Runtime™ (LSE-3). Error Recovery. Real: diagnoses the
// runtime first (../diagnoseRuntimeHealth.ts); a healthy runtime is
// returned completely unchanged — an honest no-op, never a fabricated
// "recovery" of something that wasn't broken. An unhealthy runtime is
// recovered by a fresh, real call to LSE-2's own public `startRuntime`
// against the current, real ULO — the only legitimate way to produce a
// valid `AdaptiveRuntimeState` without reaching into LSE-2's internals.
// This never attempts to patch the inconsistent fields in place — a
// runtime that failed its own health check is not trusted to be safely
// patchable.
export function recoverRuntime(runtime: AdaptiveRuntimeState, ulo: UniversalLearningObject, options: RuntimeActionOptions = {}): RuntimeActionResult {
  const health = diagnoseRuntimeHealth(runtime, ulo)
  if (health.healthy) return { success: true, state: runtime, events: [] }

  return startRuntime(ulo, runtime.session.learnerId, runtime.session.sessionType, runtime.strategy, options)
}
