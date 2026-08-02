import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type { AdaptiveRuntimeState, RuntimeActionResult } from '@/core/adaptive-learning-runtime'
import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import type { LearningMode } from '@/core/learning-mode-integration'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { applyModeSessionDecision } from '../orchestration/applyModeSessionDecision'
import { resolveCurrentChunkView } from '../orchestration/resolveCurrentChunkView'
import { loadUniversalLearningObject } from '../persistence/loadUniversalLearningObject'
import { createSupabaseSessionPersistenceAdapter } from '../persistence/createSupabaseSessionPersistenceAdapter'
import type { ModeSessionActionResult } from '../types/ModeSessionActionResult'

// Shared Learning Runtime — Memory Mode™ Sprint-1 shared-extraction.
// Moved and renamed from Quantum Speed Reading™'s own
// `actions/runReadingSessionDecision.ts` (Sprint-1) — every genuinely
// shared mechanic behind a session-lifecycle decision (auth, ownership
// check, ULO load, decision + adapter dispatch, persistence, and
// resulting chunk-view derivation), parameterized on `mode: LearningMode`
// instead of hardcoding Quantum Speed Reading™. Every Learning Mode's own
// navigation/lifecycle actions (next/previous/pause/resume/finish/…)
// compose this one real function, never a second copy of it.
//
// Disclosed, minor, non-functional difference from QSR's own pre-
// extraction error strings: these messages are now mode-agnostic
// ("Session not found." rather than "Reading session not found.") since
// this function now genuinely serves more than one mode. No test in this
// codebase asserts on the exact string, and no control-flow, persisted
// data, or success/failure outcome changed — only this diagnostic
// wording.
export async function runModeSessionDecision(mode: LearningMode, sessionId: string, decide: (runtime: AdaptiveRuntimeState, ulo: UniversalLearningObject) => RuntimeActionResult): Promise<ModeSessionActionResult> {
  const supabase = await createClient()
  return runModeSessionDecisionWithClient(mode, supabase, sessionId, decide)
}

export async function runModeSessionDecisionWithClient(
  mode: LearningMode,
  supabase: SupabaseClient<Database>,
  sessionId: string,
  decide: (runtime: AdaptiveRuntimeState, ulo: UniversalLearningObject) => RuntimeActionResult,
): Promise<ModeSessionActionResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not signed in.' }

  const persistence = createSupabaseSessionPersistenceAdapter(supabase, user.id, mode.capabilities.sessionType)
  const snapshot = await persistence.load(sessionId)
  if (!snapshot) return { success: false, error: 'Session not found.' }

  if (snapshot.learnerId !== user.id) {
    logger.warn('rejected mode session action for a session not owned by the caller', { sessionId, userId: user.id, mode: mode.type })
    return { success: false, error: 'Session not found.' }
  }

  const ulo = await loadUniversalLearningObject(supabase, snapshot.documentId)
  if (!ulo) return { success: false, error: 'The document for this session is no longer available.' }

  const outcome = applyModeSessionDecision(mode, snapshot, ulo, decide)
  if (!outcome.success) return { success: false, error: outcome.error.message }

  try {
    await persistence.save(outcome.snapshot)
  } catch {
    return { success: false, error: 'Failed to save session progress.' }
  }

  return {
    success: true,
    snapshot: outcome.snapshot,
    currentChunk: resolveCurrentChunkView(outcome.runtime, ulo),
    queueIndex: outcome.runtime.position.queueIndex,
    totalChunks: outcome.runtime.scheduledQueue.items.length,
    estimatedTimeLeftSeconds: outcome.runtime.progress.estimatedTimeLeftSeconds,
  }
}
