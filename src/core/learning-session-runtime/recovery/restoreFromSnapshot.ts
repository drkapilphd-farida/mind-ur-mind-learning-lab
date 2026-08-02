import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import type { AdaptiveRuntimeState, RuntimeActionOptions, RuntimeActionResult, RuntimeEvent } from '@/core/adaptive-learning-runtime'
import { startRuntime, continueRuntime, skipChunk } from '@/core/adaptive-learning-runtime'
import type { SessionSnapshot } from '../types/SessionSnapshot'

// Learning Session Runtime™ (LSE-3). Session Persistence — rehydration.
// Real: reconstructs a live `AdaptiveRuntimeState` from a real, persisted
// `SessionSnapshot`, entirely through LSE-2's own public decisions
// (`startRuntime`, `continueRuntime`, `skipChunk`) — never by hand-
// constructing `scheduledQueue`/`position`/`progress`, which stay LSE-2's
// exclusive derivation. `repeatCounts` and `revisitChunkIds` are safe to
// overlay directly (neither is incrementally mutated by `continueRuntime`/
// `skipChunk`); `completedChunkIds`/`skippedChunkIds` are deliberately NOT
// overlaid — they are re-derived by literally replaying the real decision
// that produced each one, so LSE-2's own bookkeeping (e.g. `skipChunk`'s
// own real append to `skippedChunkIds`) is never duplicated by a second,
// competing write.
//
// Replay walks the *current* real scheduled position at each step — never
// a pre-assumed order — and classifies it as "completed" or "skipped" by
// real set membership against the snapshot. This is order-independent and
// correct regardless of how completions/skips were originally interleaved,
// because Chunk Scheduling is re-applied fresh by LSE-2 on every real
// decision call regardless.
//
// The restored runtime's own `eventLog` is an honest, freshly-generated
// replay log, not a byte-for-byte historical record — the persisted
// `SessionSnapshot` (types/SessionSnapshot.ts), not the live eventLog, is
// this layer's durable Session History source of truth.
export function restoreFromSnapshot(snapshot: SessionSnapshot, ulo: UniversalLearningObject, options: RuntimeActionOptions = {}): RuntimeActionResult {
  if (snapshot.uloId !== ulo.id) {
    return { success: false, error: { code: 'ulo-mismatch', message: `Snapshot was captured against ULO "${snapshot.uloId}", not "${ulo.id}".` } }
  }

  const started = startRuntime(ulo, snapshot.learnerId, snapshot.sessionType, snapshot.strategy, options)
  if (!started.success) return started

  let current: AdaptiveRuntimeState = { ...started.state, repeatCounts: snapshot.repeatCounts, revisitChunkIds: snapshot.revisitChunkIds }
  const events: RuntimeEvent[] = [...started.events]

  const completedSet = new Set(snapshot.completedChunkIds)
  const skippedSet = new Set(snapshot.skippedChunkIds)
  const totalStepsToReplay = snapshot.completedChunkIds.length + snapshot.skippedChunkIds.length

  for (let step = 0; step < totalStepsToReplay; step += 1) {
    if (current.session.status !== 'active') break
    const currentItem = current.scheduledQueue.items[current.position.queueIndex]
    if (!currentItem) break

    let result: RuntimeActionResult
    if (completedSet.has(currentItem.chunkNodeId)) {
      result = continueRuntime(current, ulo, options)
    } else if (skippedSet.has(currentItem.chunkNodeId)) {
      result = skipChunk(current, ulo, options)
    } else {
      break
    }

    if (!result.success) return result
    events.push(...result.events)
    current = result.state
  }

  return { success: true, state: current, events }
}
