'use server'

import { createClient } from '@/lib/supabase/server'
import { createSupabaseSessionPersistenceAdapter } from '../persistence/createSupabaseSessionPersistenceAdapter'
import { SessionIdSchema } from '../types/schemas'
import type { GetReadingProgressResult } from '../types/GetReadingProgressResult'

// Quantum Speed Reading™ Production Sprint-1. Analytics — reuses LSE-3's
// own real, already-persisted `SessionSnapshot.completionPercentage`/
// `metrics` directly. No runtime restoration/replay here — a pure
// progress read never needs to reconstruct the live `AdaptiveRuntimeState`,
// only the already-derived summary already sitting in the database. No
// new analytics system; no new metric.
export async function getReadingProgress(input: unknown): Promise<GetReadingProgressResult> {
  const parsed = SessionIdSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid reading session request.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not signed in.' }

  const persistence = createSupabaseSessionPersistenceAdapter(supabase, user.id)
  const snapshot = await persistence.load(parsed.data)
  if (!snapshot || snapshot.learnerId !== user.id) return { success: false, error: 'Reading session not found.' }

  return {
    success: true,
    status: snapshot.status,
    completionPercentage: snapshot.completionPercentage,
    metrics: snapshot.metrics,
  }
}
