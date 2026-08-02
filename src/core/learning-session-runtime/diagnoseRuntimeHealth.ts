import type { AdaptiveRuntimeState } from '@/core/adaptive-learning-runtime'
import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import type { RuntimeHealthCheck, RuntimeHealthIssue } from './types/RuntimeHealth'

// Learning Session Runtime™ (LSE-3). Error Recovery. Pure. The ONE shared
// implementation of "is this runtime genuinely still consistent with the
// ULO it claims to be built against" — every real, checkable inconsistency
// only, never a speculative one. `recoverRuntime.ts` is the one caller that
// acts on this result.
export function diagnoseRuntimeHealth(runtime: AdaptiveRuntimeState, ulo: UniversalLearningObject): RuntimeHealthCheck {
  const issues: RuntimeHealthIssue[] = []

  if (runtime.session.uloId !== ulo.id) {
    issues.push({ code: 'ulo-mismatch', message: `Runtime was built against ULO "${runtime.session.uloId}", not "${ulo.id}".` })
  } else if (runtime.session.uloVersion.revision !== ulo.version.revision) {
    issues.push({ code: 'ulo-version-stale', message: `Runtime was built against ULO revision ${runtime.session.uloVersion.revision}, but the current ULO is revision ${ulo.version.revision}.` })
  }

  const { queueIndex, chunkNodeId } = runtime.position
  if (queueIndex < 0 || queueIndex > runtime.scheduledQueue.items.length) {
    issues.push({ code: 'position-corrupted', message: `Runtime position queueIndex ${queueIndex} is out of bounds for a scheduled queue of ${runtime.scheduledQueue.items.length} items.` })
  } else if (chunkNodeId !== null && runtime.scheduledQueue.items[queueIndex]?.chunkNodeId !== chunkNodeId) {
    issues.push({ code: 'position-corrupted', message: `Runtime position chunkNodeId "${chunkNodeId}" does not match the scheduled queue item at index ${queueIndex}.` })
  }

  if (runtime.scheduledQueue.items.length === 0 && runtime.session.status === 'active') {
    issues.push({ code: 'empty-queue-while-active', message: 'Runtime has an empty scheduled queue but is still active — it should have completed.' })
  }

  return issues.length === 0 ? { healthy: true } : { healthy: false, issues }
}
