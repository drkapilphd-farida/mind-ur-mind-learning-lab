import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import type { AdaptiveRuntimeState, RuntimeEvent } from '@/core/adaptive-learning-runtime'
import type { LearningMode } from './types/LearningMode'

// Learning Mode Runtime Integration™ (LSE-4). Session event forwarding +
// Runtime callback contracts — the ONE shared implementation of "turn a
// real LSE-2 `RuntimeEvent` into the matching real `RuntimeModeAdapter`
// hook call." A mode with no `adapter` registered is a real, honest no-op
// — not an error. The real chunk a chunk-scoped event refers to is
// resolved from the ULO already in hand (`ulo.knowledge.chunks`), never
// re-fetched or re-parsed.
//
// Three real `RuntimeEventType`s have deliberately no matching hook, and
// are silently skipped rather than forced onto an unrelated one:
// `progress-updated`, `runtime-paused`, `runtime-resumed` — LSE-2's own
// `RuntimeModeAdapter` never reserved hooks for these, and this layer does
// not invent behavior LSE-2 itself didn't design. Symmetrically,
// `onRuntimeStarted` has no matching `RuntimeEvent` at all (LSE-2 emits no
// `'runtime-started'` event) — it is called once, directly, by
// `startModeRuntime.ts`, not from this per-event dispatcher.
export function dispatchRuntimeEvents(mode: LearningMode, ulo: UniversalLearningObject, state: AdaptiveRuntimeState, events: readonly RuntimeEvent[]): void {
  const adapter = mode.adapter
  if (!adapter) return

  for (const event of events) {
    switch (event.type) {
      case 'chunk-started': {
        const chunk = ulo.knowledge.chunks.find((candidate) => candidate.id === event.chunkNodeId)
        if (chunk) adapter.onChunkStarted?.(state, chunk)
        break
      }
      case 'chunk-completed': {
        const chunk = ulo.knowledge.chunks.find((candidate) => candidate.id === event.chunkNodeId)
        if (chunk) adapter.onChunkCompleted?.(state, chunk)
        break
      }
      case 'chunk-skipped': {
        const chunk = ulo.knowledge.chunks.find((candidate) => candidate.id === event.chunkNodeId)
        if (chunk) adapter.onChunkSkipped?.(state, chunk)
        break
      }
      case 'chunk-repeated': {
        const chunk = ulo.knowledge.chunks.find((candidate) => candidate.id === event.chunkNodeId)
        if (chunk) adapter.onChunkRepeated?.(state, chunk, event.repeatCount)
        break
      }
      case 'chunk-marked-for-revisit': {
        const chunk = ulo.knowledge.chunks.find((candidate) => candidate.id === event.chunkNodeId)
        if (chunk) adapter.onChunkMarkedForRevisit?.(state, chunk)
        break
      }
      case 'checkpoint-reached':
        adapter.onCheckpointReached?.(state, event)
        break
      case 'runtime-completed':
        adapter.onRuntimeCompleted?.(state)
        break
      case 'progress-updated':
      case 'runtime-paused':
      case 'runtime-resumed':
        break
    }
  }
}
