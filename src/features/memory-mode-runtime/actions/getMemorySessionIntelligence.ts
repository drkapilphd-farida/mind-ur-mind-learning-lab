'use server'

import { createClient } from '@/lib/supabase/server'
import { createSupabaseSessionPersistenceAdapter, SessionIdSchema } from '@/features/learning-mode-runtime'
import { memoryLearningMode } from '@/core/learning-modes/memory-mode'
import { computeMemorySessionTracking } from '../intelligence/computeMemorySessionTracking'
import { computeMemoryConfidenceScore } from '../intelligence/computeMemoryConfidenceScore'
import { recommendAdaptiveDifficulty } from '../intelligence/recommendAdaptiveDifficulty'
import { recommendContinueStrategy } from '../intelligence/recommendContinueStrategy'
import type { MemorySessionTracking, AdaptiveDifficultyRecommendation, SmartContinueRecommendation } from '../intelligence/types'

export type GetMemorySessionIntelligenceResult =
  | {
      success: true
      tracking: MemorySessionTracking
      confidenceScore: number
      difficultyRecommendation: AdaptiveDifficultyRecommendation
      continueRecommendation: SmartContinueRecommendation
    }
  | { success: false; error: string }

// Memory Mode™ Sprint-3 — Adaptive Memory Intelligence™. Real-time
// intelligence for one specific session — tracking, confidence, an
// adaptive difficulty recommendation, and a Smart Continue
// recommendation — all runtime-only decisions, computed entirely from
// this session's own real, already-persisted `SessionSnapshot`. Reuses
// the Shared Learning Runtime's own persistence adapter (Sprint-1)
// exactly like `getMemoryProgress` does; no new query, no new table.
export async function getMemorySessionIntelligence(input: unknown): Promise<GetMemorySessionIntelligenceResult> {
  const parsed = SessionIdSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid memory session request.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not signed in.' }

  const persistence = createSupabaseSessionPersistenceAdapter(supabase, user.id, memoryLearningMode.capabilities.sessionType)
  const snapshot = await persistence.load(parsed.data)
  if (!snapshot || snapshot.learnerId !== user.id) return { success: false, error: 'Memory session not found.' }

  const tracking = computeMemorySessionTracking(snapshot)

  return {
    success: true,
    tracking,
    confidenceScore: computeMemoryConfidenceScore(tracking),
    difficultyRecommendation: recommendAdaptiveDifficulty(tracking),
    continueRecommendation: recommendContinueStrategy(snapshot, tracking),
  }
}
