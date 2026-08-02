import type { PipelineStage } from '../types'
import { IllegalPipelineTransitionError } from './IllegalPipelineTransitionError'

// The legal transition graph: each non-terminal stage advances to
// exactly the next success stage, or to `failed` (from any non-terminal
// sub-service validation failure); `completed`/`failed` are both
// terminal. Pure — same idiom as
// `personalization-engine/lifecycle/transitionPersonalizationLifecycle.ts`.
const ALLOWED_TRANSITIONS: Record<PipelineStage, readonly PipelineStage[]> = {
  initialized: ['context-ready', 'failed'],
  'context-ready': ['prompt-ready', 'failed'],
  'prompt-ready': ['request-ready', 'failed'],
  'request-ready': ['response-normalized', 'failed'],
  'response-normalized': ['completed', 'failed'],
  completed: [],
  failed: [],
}

export function transitionPipelineStage(from: PipelineStage, to: PipelineStage): PipelineStage {
  const allowed = ALLOWED_TRANSITIONS[from]
  if (!allowed.includes(to)) throw new IllegalPipelineTransitionError(from, to)
  return to
}
