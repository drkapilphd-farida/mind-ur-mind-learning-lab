import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import type { RuntimeActionResult } from '@/core/adaptive-learning-runtime'
import type { LearningMode } from './types/LearningMode'
import { dispatchRuntimeEvents } from './dispatchRuntimeEvents'

// Learning Mode Runtime Integration™ (LSE-4). The generic, composable
// "Runtime ↔ LearningMode adapter" — wraps the real result of ANY of
// LSE-2's own 9 decisions (`continueRuntime`, `skipChunk`, `pauseRuntime`,
// ...) and forwards its real events to the mode's adapter on success,
// never on a real failure (an illegal transition never reaches a learner's
// mode callbacks as if it had happened). One shared implementation for
// all 9 decisions — never a hand-written wrapper per decision, which would
// be exactly the "duplicate runtime logic" this sprint must not produce.
export function dispatchAfterDecision(mode: LearningMode, ulo: UniversalLearningObject, result: RuntimeActionResult): RuntimeActionResult {
  if (result.success) dispatchRuntimeEvents(mode, ulo, result.state, result.events)
  return result
}
