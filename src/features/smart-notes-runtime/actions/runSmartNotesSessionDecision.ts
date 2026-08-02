import type { AdaptiveRuntimeState, RuntimeActionResult } from '@/core/adaptive-learning-runtime'
import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import { smartNotesMode } from '@/core/learning-modes/smart-notes'
import { runModeSessionDecision } from '@/features/learning-mode-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'

// Smart Notes™ Sprint-1. NOT a Server Action itself — mirrors Memory
// Mode™'s own `runMemorySessionDecision.ts`, delegating straight to the
// Shared Learning Runtime's `runModeSessionDecision` rather than needing
// its own copy, since Smart Notes has no pre-existing public API surface
// to preserve. Every navigation/lifecycle action below composes this one
// function, naming only which real LSE-2 decision it applies.
export async function runSmartNotesSessionDecision(sessionId: string, decide: (runtime: AdaptiveRuntimeState, ulo: UniversalLearningObject) => RuntimeActionResult): Promise<ModeSessionActionResult> {
  return runModeSessionDecision(smartNotesMode, sessionId, decide)
}
