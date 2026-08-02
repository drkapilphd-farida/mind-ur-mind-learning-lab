import type { AdaptiveRuntimeState, RuntimeActionResult } from '@/core/adaptive-learning-runtime'
import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import { revisionLearningMode } from '@/core/learning-modes/revision-mode'
import { runModeSessionDecision } from '@/features/learning-mode-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'

// Revision Mode™ Sprint ALS-17. NOT a Server Action itself — mirrors
// Memory Mode™'s own `runMemorySessionDecision.ts`, delegating straight
// to the Shared Learning Runtime's `runModeSessionDecision`. Every
// navigation/lifecycle action below composes this one function, naming
// only which real LSE-2 decision it applies.
export async function runRevisionSessionDecision(sessionId: string, decide: (runtime: AdaptiveRuntimeState, ulo: UniversalLearningObject) => RuntimeActionResult): Promise<ModeSessionActionResult> {
  return runModeSessionDecision(revisionLearningMode, sessionId, decide)
}
