import type { AdaptiveRuntimeState, RuntimeActionResult } from '@/core/adaptive-learning-runtime'
import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import { memoryLearningMode } from '@/core/learning-modes/memory-mode'
import { runModeSessionDecision } from '@/features/learning-mode-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'

// Memory Mode™ Sprint-1. NOT a Server Action itself — mirrors Quantum
// Speed Reading™'s own `runReadingSessionDecision.ts`, except it delegates
// straight to the Shared Learning Runtime's `runModeSessionDecision`
// rather than needing its own copy, since Memory Mode has no pre-existing
// public API surface to preserve. Every navigation/lifecycle action below
// composes this one function, naming only which real LSE-2 decision it
// applies.
export async function runMemorySessionDecision(sessionId: string, decide: (runtime: AdaptiveRuntimeState, ulo: UniversalLearningObject) => RuntimeActionResult): Promise<ModeSessionActionResult> {
  return runModeSessionDecision(memoryLearningMode, sessionId, decide)
}
