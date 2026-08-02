import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import type { LearningSession } from '../types/LearningSession'
import type { SessionEvent } from '../types/SessionEvent'
import type { SessionActionOptions, SessionActionResult } from '../types/SessionActionResult'
import { validateTransition } from '../internal/validateTransition'
import { computeSessionProgress } from '../internal/computeSessionProgress'
import { buildPositionEvents } from '../internal/buildPositionEvents'

// Universal Learning Session Engine™ (LSE-1). Marks the session's
// current position completed and advances. Real: if more real queue
// items remain, emits chunk-started (+ checkpoint-reached if
// applicable, via the shared buildPositionEvents) + progress-updated;
// if the real queue is exhausted, transitions to 'completed' and emits
// session-completed instead — never a hardcoded second copy of either
// action's logic.
export function continueSession(session: LearningSession, ulo: UniversalLearningObject, options: SessionActionOptions = {}): SessionActionResult {
  const transition = validateTransition('continue', session.status)
  if (!transition.success) return { success: false, error: transition.error }

  if (session.uloId !== ulo.id) {
    return { success: false, error: { code: 'ulo-mismatch', message: `Session was built against ULO "${session.uloId}", not "${ulo.id}".` } }
  }

  const now = options.now ?? (() => new Date())
  const idFactory = options.idFactory ?? (() => crypto.randomUUID())
  const nowIso = now().toISOString()

  const currentItem = session.queue.items[session.position.queueIndex]
  const completedChunkIds = currentItem ? [...session.progress.completedChunkIds, currentItem.chunkNodeId] : session.progress.completedChunkIds
  const chunkCompletedEvent: SessionEvent | null = currentItem ? { id: idFactory(), type: 'chunk-completed', occurredAt: nowIso, chunkNodeId: currentItem.chunkNodeId } : null

  const progress = computeSessionProgress(session.queue, completedChunkIds, ulo)
  const nextQueueIndex = session.position.queueIndex + 1
  const nextItem = session.queue.items[nextQueueIndex]

  const events: SessionEvent[] = chunkCompletedEvent ? [chunkCompletedEvent] : []

  if (nextItem) {
    events.push(...buildPositionEvents(session.queue, nextQueueIndex, now, idFactory))
    events.push({ id: idFactory(), type: 'progress-updated', occurredAt: nowIso, completionPercentage: progress.completionPercentage })

    const updatedSession: LearningSession = {
      ...session,
      version: { ...session.version, revision: session.version.revision + 1 },
      status: 'active',
      position: { queueIndex: nextQueueIndex, chunkNodeId: nextItem.chunkNodeId },
      progress,
      eventLog: [...session.eventLog, ...events],
      lastModifiedAt: nowIso,
    }

    return { success: true, session: updatedSession, events }
  }

  events.push({ id: idFactory(), type: 'progress-updated', occurredAt: nowIso, completionPercentage: progress.completionPercentage })
  events.push({ id: idFactory(), type: 'session-completed', occurredAt: nowIso })

  const updatedSession: LearningSession = {
    ...session,
    version: { ...session.version, revision: session.version.revision + 1 },
    status: 'completed',
    position: { queueIndex: nextQueueIndex, chunkNodeId: null },
    progress,
    eventLog: [...session.eventLog, ...events],
    completedAt: nowIso,
    lastModifiedAt: nowIso,
  }

  return { success: true, session: updatedSession, events }
}
