import type { AdaptiveRuntimeState, RuntimeActionResult } from '@/core/adaptive-learning-runtime'
import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import { researchLearningMode } from '@/core/learning-modes/research-mode'
import { runModeSessionDecision } from '@/features/learning-mode-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'

// Research Mode™ — Production AI Integration (ALS-24). NOT a Server
// Action itself — mirrors Revision Mode™'s own
// `runRevisionSessionDecision.ts`, delegating straight to the Shared
// Learning Runtime's `runModeSessionDecision`. Every navigation/lifecycle
// action below composes this one function, naming only which real LSE-2
// decision it applies.
export async function runResearchSessionDecision(sessionId: string, decide: (runtime: AdaptiveRuntimeState, ulo: UniversalLearningObject) => RuntimeActionResult): Promise<ModeSessionActionResult> {
  return runModeSessionDecision(researchLearningMode, sessionId, decide)
}
