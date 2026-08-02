import type { AdaptiveRuntimeState, RuntimeActionResult } from '@/core/adaptive-learning-runtime'
import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import { focusLearningMode } from '@/core/learning-modes/focus-mode'
import { runModeSessionDecision } from '@/features/learning-mode-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'

// Focus Mode™ (Mini) Sprint ALS-16. NOT a Server Action itself — mirrors
// Memory Mode™'s own `runMemorySessionDecision.ts`, delegating straight to
// the Shared Learning Runtime's `runModeSessionDecision`. Every
// navigation/lifecycle action below composes this one function, naming
// only which real LSE-2 decision it applies.
export async function runFocusSessionDecision(sessionId: string, decide: (runtime: AdaptiveRuntimeState, ulo: UniversalLearningObject) => RuntimeActionResult): Promise<ModeSessionActionResult> {
  return runModeSessionDecision(focusLearningMode, sessionId, decide)
}
