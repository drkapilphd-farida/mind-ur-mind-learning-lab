import type { LearningChunk } from '@/core/universal-learning-engine/universal-learning-object'
import type { LearningModeType } from '@/core/learning-session-engine'
import type { AdaptiveRuntimeState } from './AdaptiveRuntimeState'
import type { RuntimeEvent } from './RuntimeEvent'

// Adaptive Learning Runtime™ (LSE-2) — RESERVED extension point.
// "Reserve production interfaces only for [the 9 named Learning
// Modes]... No implementation yet." `LearningModeType` is reused
// verbatim from LSE-1 (never a second, duplicate enum) — every named
// mode already has exactly one real value there. `RuntimeModeAdapter`
// is the runtime-layer sibling of LSE-1's own `LearningModeAdapter`: it
// reacts to the decisions LSE-1 has no concept of (repeat/skip/
// revisit-later) in addition to the shared lifecycle ones. Every method
// is optional and returns `void` — this sprint reserves the shape only;
// no runtime decision actually calls into a `RuntimeModeAdapter` yet,
// and no concrete adapter is implemented for any named mode.
export type { LearningModeType } from '@/core/learning-session-engine'

export type RuntimeModeAdapter = {
  type: LearningModeType
  onRuntimeStarted?: (state: AdaptiveRuntimeState) => void
  onChunkStarted?: (state: AdaptiveRuntimeState, chunk: LearningChunk) => void
  onChunkCompleted?: (state: AdaptiveRuntimeState, chunk: LearningChunk) => void
  onChunkSkipped?: (state: AdaptiveRuntimeState, chunk: LearningChunk) => void
  onChunkRepeated?: (state: AdaptiveRuntimeState, chunk: LearningChunk, repeatCount: number) => void
  onChunkMarkedForRevisit?: (state: AdaptiveRuntimeState, chunk: LearningChunk) => void
  onCheckpointReached?: (state: AdaptiveRuntimeState, event: Extract<RuntimeEvent, { type: 'checkpoint-reached' }>) => void
  onRuntimeCompleted?: (state: AdaptiveRuntimeState) => void
}
