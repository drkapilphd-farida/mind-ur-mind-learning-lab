import type { RuntimeState } from '../types'
import { IllegalRuntimeStateTransitionError } from './IllegalRuntimeStateTransitionError'
import type { RuntimeLifecycleManager } from './RuntimeLifecycleManager'

// The legal transition graph — "## Execution Flow" (§ brief), verbatim
// linear order, plus every non-terminal state may also transition to
// `failed` — mirrors
// `ai-orchestration-pipeline/pipeline/transitionPipelineStage.ts`'s
// own idiom.
const ALLOWED_TRANSITIONS: Record<RuntimeState, readonly RuntimeState[]> = {
  pending: ['personalization-ready', 'failed'],
  'personalization-ready': ['recommendation-ready', 'failed'],
  'recommendation-ready': ['mentor-ready', 'failed'],
  'mentor-ready': ['provider-selected', 'failed'],
  'provider-selected': ['model-selected', 'failed'],
  'model-selected': ['request-ready', 'failed'],
  'request-ready': ['adapter-processed', 'failed'],
  'adapter-processed': ['response-ready', 'failed'],
  'response-ready': ['completed', 'failed'],
  completed: [],
  failed: [],
}

export class DefaultRuntimeLifecycleManager implements RuntimeLifecycleManager {
  transition(from: RuntimeState, to: RuntimeState): RuntimeState {
    const allowed = ALLOWED_TRANSITIONS[from]
    if (!allowed.includes(to)) throw new IllegalRuntimeStateTransitionError(from, to)
    return to
  }
}

export function createRuntimeLifecycleManager(): RuntimeLifecycleManager {
  return new DefaultRuntimeLifecycleManager()
}
