import type { LearningQueue } from '@/core/learning-session-engine'
import type { RuntimeEvent } from '../types/RuntimeEvent'

// Adaptive Learning Runtime™ (LSE-2). Checkpoint Runtime (automatic
// half) + Session Navigation. Pure. The ONE shared implementation of
// "entering a new scheduled-queue position" — startRuntime.ts and
// continueRuntime.ts both call this rather than each hardcoding its own
// chunk-started/checkpoint-reached emission logic. Mirrors LSE-1's own
// `buildPositionEvents.ts` pattern exactly, over the runtime's own
// `scheduledQueue` and `RuntimeEvent` type instead. A real
// `checkpoint-reached` event is only emitted when the real queue item's
// own `isCheckpoint`/`checkpointConceptNodeId`/`checkpointLabel`
// (already resolved by LSE-1's `buildLearningQueue`, carried through
// every chunk-scheduling strategy unchanged) say so — never speculative.
export function buildAdvanceEvents(queue: LearningQueue, queueIndex: number, now: () => Date, idFactory: () => string): readonly RuntimeEvent[] {
  const item = queue.items[queueIndex]
  if (!item) return []

  const nowIso = now().toISOString()
  const events: RuntimeEvent[] = [{ id: idFactory(), type: 'chunk-started', occurredAt: nowIso, chunkNodeId: item.chunkNodeId }]

  if (item.isCheckpoint && item.checkpointConceptNodeId !== undefined && item.checkpointLabel !== undefined) {
    events.push({ id: idFactory(), type: 'checkpoint-reached', occurredAt: nowIso, conceptNodeId: item.checkpointConceptNodeId, label: item.checkpointLabel })
  }

  return events
}
