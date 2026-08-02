'use server'

import { createClient } from '@/lib/supabase/server'
import { createSupabaseSessionPersistenceAdapter, SessionIdSchema } from '@/features/learning-mode-runtime'
import { smartNotesMode } from '@/core/learning-modes/smart-notes'
import { computeSmartNotesSessionTracking, computeSmartNotesEngagementScore, recommendNoteTakingPace, recommendSmartNotesContinueStrategy } from '../intelligence'
import type { SmartNotesSessionTracking, NoteTakingPaceRecommendation, SmartNotesContinueRecommendation } from '../intelligence'

export type GetSmartNotesSessionIntelligenceResult =
  | {
      success: true
      tracking: SmartNotesSessionTracking
      engagementScore: number
      paceRecommendation: NoteTakingPaceRecommendation
      continueRecommendation: SmartNotesContinueRecommendation
    }
  | { success: false; error: string }

// Smart Notes™ Sprint-3 — Adaptive Intelligence™. Real-time intelligence
// for one specific session — tracking, engagement, a note-taking pace
// recommendation, and a Smart Continue recommendation — all runtime-only
// decisions, computed entirely from this session's own real,
// already-persisted `SessionSnapshot`. Reuses the Shared Learning
// Runtime's own persistence adapter exactly like `getSmartNotesProgress`
// does; no new query, no new table.
export async function getSmartNotesSessionIntelligence(input: unknown): Promise<GetSmartNotesSessionIntelligenceResult> {
  const parsed = SessionIdSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid smart notes session request.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not signed in.' }

  const persistence = createSupabaseSessionPersistenceAdapter(supabase, user.id, smartNotesMode.capabilities.sessionType)
  const snapshot = await persistence.load(parsed.data)
  if (!snapshot || snapshot.learnerId !== user.id) return { success: false, error: 'Smart notes session not found.' }

  const tracking = computeSmartNotesSessionTracking(snapshot)

  return {
    success: true,
    tracking,
    engagementScore: computeSmartNotesEngagementScore(tracking),
    paceRecommendation: recommendNoteTakingPace(tracking),
    continueRecommendation: recommendSmartNotesContinueStrategy(snapshot, tracking),
  }
}
