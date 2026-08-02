import type { AdaptiveRuntimeState, RuntimeActionResult } from '@/core/adaptive-learning-runtime'
import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import { mcqsLearningMode } from '@/core/learning-modes/mcqs-mode'
import { runModeSessionDecision } from '@/features/learning-mode-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'

// MCQs™ Sprint ALS-17. NOT a Server Action itself — mirrors Memory Mode™'s
// own `runMemorySessionDecision.ts`, delegating straight to the Shared
// Learning Runtime's `runModeSessionDecision`. Every navigation/lifecycle
// action below composes this one function, naming only which real LSE-2
// decision it applies.
export async function runMcqsSessionDecision(sessionId: string, decide: (runtime: AdaptiveRuntimeState, ulo: UniversalLearningObject) => RuntimeActionResult): Promise<ModeSessionActionResult> {
  return runModeSessionDecision(mcqsLearningMode, sessionId, decide)
}
