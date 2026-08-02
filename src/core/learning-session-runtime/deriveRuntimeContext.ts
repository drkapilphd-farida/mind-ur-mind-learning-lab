import type { AdaptiveRuntimeState } from '@/core/adaptive-learning-runtime'
import type { RuntimeContext } from './types/RuntimeContext'

// Learning Session Runtime™ (LSE-3). Pure. The ONE shared implementation of
// "gather the real ambient identifiers off a runtime" — every LSE-3 function
// that needs them calls this, never re-reading `runtime.session.*` fields
// independently.
export function deriveRuntimeContext(runtime: AdaptiveRuntimeState): RuntimeContext {
  return {
    learnerId: runtime.session.learnerId,
    documentId: runtime.session.documentId,
    uloId: runtime.session.uloId,
    uloVersion: runtime.session.uloVersion,
    sessionId: runtime.session.id,
    runtimeId: runtime.id,
    sessionType: runtime.session.sessionType,
  }
}
