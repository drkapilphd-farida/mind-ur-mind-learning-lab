import type { SessionType, UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import type { LearningSession } from '../types/LearningSession'
import type { SessionEvent } from '../types/SessionEvent'
import type { SessionStatus } from '../types/SessionStatus'
import type { SessionActionOptions, SessionActionResult } from '../types/SessionActionResult'
import { buildLearningQueue } from '../internal/buildLearningQueue'
import { computeSessionProgress } from '../internal/computeSessionProgress'
import { buildPositionEvents } from '../internal/buildPositionEvents'

// Universal Learning Session Engine™ (LSE-1). Creates a brand-new
// `LearningSession` from a real ULO — never validates a transition
// (there is no prior session to transition from; a fresh session always
// begins conceptually `'not-started'`, then immediately advances). A
// ULO with a real, empty chunk queue is honestly handled: the session
// starts directly in `'completed'` with 100% progress, not a crash —
// there was genuinely nothing to do.
export function startSession(ulo: UniversalLearningObject, learnerId: string, sessionType: SessionType, options: SessionActionOptions = {}): SessionActionResult {
  const now = options.now ?? (() => new Date())
  const idFactory = options.idFactory ?? (() => crypto.randomUUID())
  const nowIso = now().toISOString()

  const queue = buildLearningQueue(ulo)
  const hasItems = queue.items.length > 0
  const progress = computeSessionProgress(queue, [], ulo)

  const position = { queueIndex: 0, chunkNodeId: hasItems ? (queue.items[0]?.chunkNodeId ?? null) : null }
  const positionEvents = hasItems ? buildPositionEvents(queue, 0, now, idFactory) : []
  const progressEvent: SessionEvent = { id: idFactory(), type: 'progress-updated', occurredAt: nowIso, completionPercentage: progress.completionPercentage }

  let status: SessionStatus = 'active'
  let completedAt: string | null = null
  let events: readonly SessionEvent[] = [...positionEvents, progressEvent]

  if (!hasItems) {
    status = 'completed'
    completedAt = nowIso
    events = [...events, { id: idFactory(), type: 'session-completed', occurredAt: nowIso }]
  }

  const session: LearningSession = {
    id: idFactory(),
    learnerId,
    documentId: ulo.documentId,
    uloId: ulo.id,
    uloVersion: ulo.version,
    sessionType,
    version: { schemaVersion: '1.0.0', revision: 1 },
    status,
    queue,
    position,
    progress,
    eventLog: events,
    startedAt: nowIso,
    completedAt,
    cancelledAt: null,
    createdAt: nowIso,
    lastModifiedAt: nowIso,
  }

  return { success: true, session, events }
}
