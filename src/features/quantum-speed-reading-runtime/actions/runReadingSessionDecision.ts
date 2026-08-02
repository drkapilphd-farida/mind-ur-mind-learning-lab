import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type { AdaptiveRuntimeState, RuntimeActionResult } from '@/core/adaptive-learning-runtime'
import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import { quantumSpeedReadingMode } from '@/core/learning-modes/quantum-speed-reading'
import { runModeSessionDecision, runModeSessionDecisionWithClient } from '@/features/learning-mode-runtime/actions/runModeSessionDecision'
import type { ReadingSessionActionResult } from '../types/ReadingSessionActionResult'

// Quantum Speed Reading™ Production Sprint-1, refactored during Memory
// Mode™ Sprint-1's shared-extraction. The real mechanics (auth, ownership
// check, ULO load, decision + adapter dispatch, persistence, chunk-view
// derivation) now live in the Shared Learning Runtime's
// `runModeSessionDecision` — generalized to take an explicit
// `mode: LearningMode` instead of hardcoding Quantum Speed Reading™. This
// thin wrapper preserves QSR's own exact original names and signatures —
// every existing caller (nextReadingChunk, previousReadingChunk,
// pauseReadingSession, resumeReadingSession, finishReadingSession,
// continueReadingSession) keeps working unchanged.
export async function runReadingSessionDecision(sessionId: string, decide: (runtime: AdaptiveRuntimeState, ulo: UniversalLearningObject) => RuntimeActionResult): Promise<ReadingSessionActionResult> {
  return runModeSessionDecision(quantumSpeedReadingMode, sessionId, decide)
}

// Exported separately, as before, so the pure decision-selection logic
// can be exercised without a live Supabase connection in a future
// integration test.
export async function runReadingSessionDecisionWithClient(
  supabase: SupabaseClient<Database>,
  sessionId: string,
  decide: (runtime: AdaptiveRuntimeState, ulo: UniversalLearningObject) => RuntimeActionResult,
): Promise<ReadingSessionActionResult> {
  return runModeSessionDecisionWithClient(quantumSpeedReadingMode, supabase, sessionId, decide)
}
