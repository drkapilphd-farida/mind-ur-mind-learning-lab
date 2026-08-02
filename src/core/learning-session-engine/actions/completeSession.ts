import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import type { LearningSession } from '../types/LearningSession'
import type { SessionEvent } from '../types/SessionEvent'
import type { SessionActionOptions, SessionActionResult } from '../types/SessionActionResult'
import { validateTransition } from '../internal/validateTransition'
import { computeSessionProgress } from '../internal/computeSessionProgress'

// Universal Learning Session Engine™ (LSE-1). Explicit early
// completion — a learner (or a future Learning Mode) can mark a
// session complete regardless of remaining queue items. Real: progress
// is recomputed treating every real queue item as completed, via the
// one shared computeSessionProgress — never a hardcoded "100%" literal.
export function completeSession(session: LearningSession, ulo: UniversalLearningObject, options: SessionActionOptions = {}): SessionActionResult {
  const transition = validateTransition('complete', session.status)
  if (!transition.success) return { success: false, error: transition.error }

  if (session.uloId !== ulo.id) {
    return { success: false, error: { code: 'ulo-mismatch', message: `Session was built against ULO "${session.uloId}", not "${ulo.id}".` } }
  }

  const now = options.now ?? (() => new Date())
  const idFactory = options.idFactory ?? (() => crypto.randomUUID())
  const nowIso = now().toISOString()

  const allChunkIds = session.queue.items.map((item) => item.chunkNodeId)
  const progress = computeSessionProgress(session.queue, allChunkIds, ulo)

  const events: SessionEvent[] = [
    { id: idFactory(), type: 'progress-updated', occurredAt: nowIso, completionPercentage: progress.completionPercentage },
    { id: idFactory(), type: 'session-completed', occurredAt: nowIso },
  ]

  const updatedSession: LearningSession = {
    ...session,
    version: { ...session.version, revision: session.version.revision + 1 },
    status: 'completed',
    progress,
    eventLog: [...session.eventLog, ...events],
    completedAt: nowIso,
    lastModifiedAt: nowIso,
  }

  return { success: true, session: updatedSession, events }
}
