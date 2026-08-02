// Adaptive Learning Runtime™ (LSE-2) — the one public import path.
// Consumes ONLY the Universal Learning Object™
// (`@/core/universal-learning-engine/universal-learning-object`) and
// the Learning Session Engine's own public barrel
// (`@/core/learning-session-engine`); never imports raw documents,
// chunks, the knowledge graph, or learning analysis directly, and never
// reaches into LSE-1's internal/ (not part of its public API). Reserves
// (type-only, unimplemented) extension points for future Learning
// Modes™ — see types/RuntimeExtension.ts.
export type {
  ChunkStrategy,
  RuntimeDecisionType,
  RuntimeEventType,
  RuntimeEvent,
  RuntimeProgress,
  LearningStateEvaluation,
  RuntimeActionErrorCode,
  RuntimeActionError,
  RuntimeActionOptions,
  RuntimeActionResult,
  RuntimeVersion,
  RuntimePosition,
  AdaptiveRuntimeState,
  LearningModeType,
  RuntimeModeAdapter,
} from './types'

export { startRuntime } from './decisions/startRuntime'
export { continueRuntime } from './decisions/continueRuntime'
export { pauseRuntime } from './decisions/pauseRuntime'
export { resumeRuntime } from './decisions/resumeRuntime'
export { repeatChunk } from './decisions/repeatChunk'
export { skipChunk } from './decisions/skipChunk'
export { revisitLater } from './decisions/revisitLater'
export { checkpointRuntime } from './decisions/checkpointRuntime'
export { completeRuntime } from './decisions/completeRuntime'
export { previousChunk } from './decisions/previousChunk'

// Learning State Evaluation — read-only, callable by a future Learning
// Mode to snapshot a chunk's real state without mutating the runtime.
export { evaluateLearningState } from './evaluateLearningState'
