import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import type { LearningSession } from '../types/LearningSession'
import type { SessionEvent } from '../types/SessionEvent'
import type { SessionActionOptions, SessionActionResult } from '../types/SessionActionResult'
import { validateTransition } from '../internal/validateTransition'
import { buildLearningQueue } from '../internal/buildLearningQueue'
import { computeSessionProgress } from '../internal/computeSessionProgress'
import { buildPositionEvents } from '../internal/buildPositionEvents'

// Universal Learning Session Engine™ (LSE-1). Restarts a session from
// any real status ("a learner can always start over"). Real: rebuilds
// the queue fresh from the passed-in `ulo` (in case it was
// re-aggregated since the original start — honest re-derivation, not
// stale data), resets position/progress/eventLog, keeps `id`/
// `learnerId`/`documentId`, and re-traces to the (possibly new)
// `uloId`/`uloVersion` — the same "new object per update, versioned"
// discipline as every other action, but starting a fresh event log
// rather than appending, since this is conceptually a new generation.
export function restartSession(session: LearningSession, ulo: UniversalLearningObject, options: SessionActionOptions = {}): SessionActionResult {
  const transition = validateTransition('restart', session.status)
  if (!transition.success) return { success: false, error: transition.error }

  const now = options.now ?? (() => new Date())
  const idFactory = options.idFactory ?? (() => crypto.randomUUID())
  const nowIso = now().toISOString()

  const queue = buildLearningQueue(ulo)
  const hasItems = queue.items.length > 0
  const progress = computeSessionProgress(queue, [], ulo)

  const position = { queueIndex: 0, chunkNodeId: hasItems ? (queue.items[0]?.chunkNodeId ?? null) : null }
  const positionEvents = hasItems ? buildPositionEvents(queue, 0, now, idFactory) : []
  const progressEvent: SessionEvent = { id: idFactory(), type: 'progress-updated', occurredAt: nowIso, completionPercentage: progress.completionPercentage }

  let events: SessionEvent[] = [...positionEvents, progressEvent]
  let status: LearningSession['status'] = 'active'
  let completedAt: string | null = null

  if (!hasItems) {
    status = 'completed'
    completedAt = nowIso
    events = [...events, { id: idFactory(), type: 'session-completed', occurredAt: nowIso }]
  }

  const updatedSession: LearningSession = {
    ...session,
    uloId: ulo.id,
    uloVersion: ulo.version,
    version: { ...session.version, revision: session.version.revision + 1 },
    status,
    queue,
    position,
    progress,
    eventLog: events,
    startedAt: nowIso,
    completedAt,
    cancelledAt: null,
    lastModifiedAt: nowIso,
  }

  return { success: true, session: updatedSession, events }
}
