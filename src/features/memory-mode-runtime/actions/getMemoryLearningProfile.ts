'use server'

import { createClient } from '@/lib/supabase/server'
import { createSupabaseSessionPersistenceAdapter } from '@/features/learning-mode-runtime'
import { memoryLearningMode } from '@/core/learning-modes/memory-mode'
import { computeMemoryLearningProfile } from '../intelligence/computeMemoryLearningProfile'
import type { MemoryLearningProfile } from '../intelligence/types/MemoryLearningProfile'

export type GetMemoryLearningProfileResult = { success: true; profile: MemoryLearningProfile } | { success: false; error: string }

// Memory Mode™ Sprint-3 — Adaptive Memory Intelligence™. Memory Learning
// Profile — reuses the Shared Learning Runtime's own
// `SessionPersistenceAdapter.listByLearner` (Sprint-1, unmodified) for
// every real memory session this learner has, then computes the real,
// deterministic aggregate. No new persistence, no new query shape beyond
// what Sprint-1 already built.
export async function getMemoryLearningProfile(): Promise<GetMemoryLearningProfileResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not signed in.' }

  const persistence = createSupabaseSessionPersistenceAdapter(supabase, user.id, memoryLearningMode.capabilities.sessionType)
  const snapshots = await persistence.listByLearner(user.id)

  return { success: true, profile: computeMemoryLearningProfile(snapshots) }
}
