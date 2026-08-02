'use server'

import { createClient } from '@/lib/supabase/server'
import { createSupabaseSessionPersistenceAdapter, SessionIdSchema } from '@/features/learning-mode-runtime'
import { memoryLearningMode } from '@/core/learning-modes/memory-mode'
import { computeSessionCompletionIntelligence } from '../intelligence/computeSessionCompletionIntelligence'
import type { SessionCompletionIntelligence } from '../intelligence/types'

export type GetMemorySessionCompletionIntelligenceResult = { success: true; intelligence: SessionCompletionIntelligence } | { success: false; error: string }

// Memory Mode™ Sprint-3 — Adaptive Memory Intelligence™. Session
// Completion Intelligence — the real, composed bundle (confidence,
// difficulty recommendation, honest insights) for a specific session,
// weighed against the learner's real full history via the same Shared
// Learning Runtime persistence adapter Sprint-1 built. Callable for any
// session regardless of its current `status`; the bundle's meaning is
// naturally strongest once that session has genuinely completed.
export async function getMemorySessionCompletionIntelligence(input: unknown): Promise<GetMemorySessionCompletionIntelligenceResult> {
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

  const historicalSnapshots = await persistence.listByLearner(user.id)

  return { success: true, intelligence: computeSessionCompletionIntelligence(snapshot, historicalSnapshots) }
}
