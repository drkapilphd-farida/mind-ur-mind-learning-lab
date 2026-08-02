'use server'

import { createClient } from '@/lib/supabase/server'
import { smartNotesMode } from '@/core/learning-modes/smart-notes'
import { createSupabaseSessionPersistenceAdapter, SessionIdSchema } from '@/features/learning-mode-runtime'
import type { SessionSnapshot } from '@/core/learning-session-runtime'

// Smart Notes™ Sprint-1. Runtime Metrics — reuses LSE-3's own real,
// already-persisted `SessionSnapshot.completionPercentage`/`metrics`
// directly, mirroring Memory Mode™'s own `getMemoryProgress.ts`. No
// runtime restoration/replay here — a pure progress read never needs to
// reconstruct the live `AdaptiveRuntimeState`, only the already-derived
// summary already sitting in the database. No new analytics system; no
// new metric.
export type GetSmartNotesProgressResult =
  | { success: true; status: SessionSnapshot['status']; completionPercentage: SessionSnapshot['completionPercentage']; metrics: SessionSnapshot['metrics'] }
  | { success: false; error: string }

export async function getSmartNotesProgress(input: unknown): Promise<GetSmartNotesProgressResult> {
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

  return {
    success: true,
    status: snapshot.status,
    completionPercentage: snapshot.completionPercentage,
    metrics: snapshot.metrics,
  }
}
