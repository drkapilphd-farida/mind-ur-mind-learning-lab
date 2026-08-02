import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import type { AdaptiveRuntimeState } from '../types/AdaptiveRuntimeState'
import type { RuntimeActionOptions, RuntimeActionResult } from '../types/RuntimeActionResult'
import { validateRuntimeTransition } from '../internal/validateRuntimeTransition'
import { applyChunkStrategy } from '../internal/applyChunkStrategy'
import { buildAdvanceEvents } from '../internal/buildAdvanceEvents'

// Adaptive Learning Runtime™ (LSE-2) — QSR Sprint-1 amendment. Runtime
// Decision Engine — Previous. Added to this locked layer only once a
// real production sprint needed real backward navigation — both the
// Quantum Speed Reading™ architecture review and its Final Lock document
// explicitly deferred this exact capability, naming "real usage evidence"
// as the trigger for reopening LSE-2 rather than approximating it at a
// higher layer (which would have meant a Learning Mode quietly
// reimplementing queue navigation itself — precisely the "duplicate
// runtime logic" this whole arc forbids).
//
// Real: does NOT alter `progress` — moving backward to look at an
// already-completed chunk is navigation, not an undo of completion.
// `completedChunkIds`/`skippedChunkIds`/`revisitChunkIds`/`repeatCounts`
// are all left untouched; only `scheduledQueue` (recomputed fresh, the
// same "re-apply chunk scheduling on every real decision" discipline
// `continueRuntime`/`skipChunk` already use, so a revisit/skip marked
// since the last advance is reflected here too) and `position` change.
// Reuses `buildAdvanceEvents` verbatim for the real `chunk-started` (+
// optional `checkpoint-reached`) emission — the same real "entering a
// queue position" logic every forward-moving decision already shares;
// this is not a second, backward-specific event-emission path.
export function previousChunk(state: AdaptiveRuntimeState, ulo: UniversalLearningObject, options: RuntimeActionOptions = {}): RuntimeActionResult {
  const transition = validateRuntimeTransition('previous-chunk', state.session.status)
  if (!transition.success) return { success: false, error: transition.error }

  if (state.session.uloId !== ulo.id) {
    return { success: false, error: { code: 'ulo-mismatch', message: `Runtime was built against ULO "${state.session.uloId}", not "${ulo.id}".` } }
  }

  const now = options.now ?? (() => new Date())
  const idFactory = options.idFactory ?? (() => crypto.randomUUID())

  const scheduledQueue = applyChunkStrategy(state.strategy, state.session.queue, ulo, state.revisitChunkIds, state.skippedChunkIds)

  const currentChunkNodeId = state.position.chunkNodeId
  if (currentChunkNodeId === null) {
    return { success: false, error: { code: 'chunk-not-in-queue', message: 'No chunk currently in view to navigate back from.' } }
  }

  const currentIndex = scheduledQueue.items.findIndex((item) => item.chunkNodeId === currentChunkNodeId)
  if (currentIndex <= 0) {
    return { success: false, error: { code: 'no-previous-chunk', message: 'Already at the first scheduled chunk — there is nothing before it.' } }
  }

  const previousIndex = currentIndex - 1
  const previousItem = scheduledQueue.items[previousIndex]
  if (!previousItem) {
    return { success: false, error: { code: 'no-previous-chunk', message: 'Already at the first scheduled chunk — there is nothing before it.' } }
  }

  const events = buildAdvanceEvents(scheduledQueue, previousIndex, now, idFactory)

  const nextState: AdaptiveRuntimeState = {
    ...state,
    version: { ...state.version, revision: state.version.revision + 1 },
    scheduledQueue,
    position: { queueIndex: previousIndex, chunkNodeId: previousItem.chunkNodeId },
    eventLog: [...state.eventLog, ...events],
    lastModifiedAt: now().toISOString(),
  }

  return { success: true, state: nextState, events }
}
