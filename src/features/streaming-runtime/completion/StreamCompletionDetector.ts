import type { StreamChunk } from '../types'

// One of the brief's own 10 named responsibilities ("completion detection"),
// deliberately its own class separate from the state machine — mirrors
// `FinishReasonResolver` (Sprint 40) being its own concern distinct from the
// pipeline that consumes it. Pure — inspects the full received chunk
// sequence, returns a boolean. Never decides *why* a sequence is or isn't
// complete (that detail lives in `validateCompletion`).
export interface StreamCompletionDetector {
  isComplete(chunks: readonly StreamChunk[]): boolean
}
