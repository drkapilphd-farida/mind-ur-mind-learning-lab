'use server'

import { createClient } from '@/lib/supabase/server'
import { createSupabaseSessionPersistenceAdapter, SessionIdSchema } from '@/features/learning-mode-runtime'
import { smartNotesMode } from '@/core/learning-modes/smart-notes'
import { computeSmartNotesSessionCompletionIntelligence } from '../intelligence'
import { countSmartNotesWithContent } from '../notes/countSmartNotesWithContent'
import type { SmartNotesSessionCompletionIntelligence } from '../intelligence'

export type GetSmartNotesSessionCompletionIntelligenceResult = { success: true; intelligence: SmartNotesSessionCompletionIntelligence } | { success: false; error: string }

// Smart Notes™ Sprint-3 — Adaptive Intelligence™. Session Completion
// Intelligence — the real, composed bundle (engagement, pace
// recommendation, honest insights) for a specific session, weighed
// against the learner's real full history and real notes coverage via
// the same Shared Learning Runtime persistence adapter Sprint-1 built.
export async function getSmartNotesSessionCompletionIntelligence(input: unknown): Promise<GetSmartNotesSessionCompletionIntelligenceResult> {
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

  const [historicalSnapshots, documentsWithNotes] = await Promise.all([persistence.listByLearner(user.id), countSmartNotesWithContent(supabase, user.id)])

  return { success: true, intelligence: computeSmartNotesSessionCompletionIntelligence(snapshot, historicalSnapshots, documentsWithNotes) }
}
