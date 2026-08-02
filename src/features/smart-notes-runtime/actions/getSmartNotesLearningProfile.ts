'use server'

import { createClient } from '@/lib/supabase/server'
import { createSupabaseSessionPersistenceAdapter } from '@/features/learning-mode-runtime'
import { smartNotesMode } from '@/core/learning-modes/smart-notes'
import { computeSmartNotesLearningProfile } from '../intelligence'
import { countSmartNotesWithContent } from '../notes/countSmartNotesWithContent'
import type { SmartNotesLearningProfile } from '../intelligence'

export type GetSmartNotesLearningProfileResult = { success: true; profile: SmartNotesLearningProfile } | { success: false; error: string }

// Smart Notes™ Sprint-3 — Adaptive Intelligence™. Smart Notes Learning
// Profile — reuses the Shared Learning Runtime's own
// `SessionPersistenceAdapter.listByLearner` (Sprint-1, unmodified) for
// every real smart-notes session this learner has, plus a real count of
// documents with saved notes, then computes the real, deterministic
// aggregate. No new persistence, no new query shape beyond what
// Sprint-1/Sprint-2 already built.
export async function getSmartNotesLearningProfile(): Promise<GetSmartNotesLearningProfileResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not signed in.' }

  const persistence = createSupabaseSessionPersistenceAdapter(supabase, user.id, smartNotesMode.capabilities.sessionType)
  const [snapshots, documentsWithNotes] = await Promise.all([persistence.listByLearner(user.id), countSmartNotesWithContent(supabase, user.id)])

  return { success: true, profile: computeSmartNotesLearningProfile(snapshots, documentsWithNotes) }
}
