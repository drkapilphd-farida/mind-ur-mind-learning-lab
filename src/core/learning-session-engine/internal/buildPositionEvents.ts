import type { LearningQueue } from '../types/LearningQueue'
import type { SessionEvent } from '../types/SessionEvent'

// Universal Learning Session Engine™ (LSE-1). Pure. The ONE shared
// implementation of "entering a new queue position" — both
// startSession.ts and continueSession.ts call this rather than each
// hardcoding its own chunk-started/checkpoint-reached emission logic.
// Real: a `checkpoint-reached` event is only emitted when the real
// queue item's own `isCheckpoint`/`checkpointConceptNodeId`/
// `checkpointLabel` (from buildLearningQueue.ts) say so — never
// speculative.
export function buildPositionEvents(queue: LearningQueue, queueIndex: number, now: () => Date, idFactory: () => string): readonly SessionEvent[] {
  const item = queue.items[queueIndex]
  if (!item) return []

  const nowIso = now().toISOString()
  const events: SessionEvent[] = [{ id: idFactory(), type: 'chunk-started', occurredAt: nowIso, chunkNodeId: item.chunkNodeId }]

  if (item.isCheckpoint && item.checkpointConceptNodeId !== undefined && item.checkpointLabel !== undefined) {
    events.push({ id: idFactory(), type: 'checkpoint-reached', occurredAt: nowIso, conceptNodeId: item.checkpointConceptNodeId, label: item.checkpointLabel })
  }

  return events
}
