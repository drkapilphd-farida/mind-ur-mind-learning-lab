'use server'

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { FocusDiscoverySessionInputSchema, type FocusDiscoverySessionResult } from '../types'

// Focus Discovery™ is reachable before sign-in, same as Reading/Memory
// Discovery — "no user" is the common case, not a failure: we silently
// skip the write rather than reject it.
//
// This only records the raw observation log (per-scene dwell time, and
// each mission's own raw behavioural counts — reaction times, false
// taps, missed targets). Nothing here is scored or analyzed — Sprint-2's
// Focus Intelligence Engine™ is what turns this into a real profile.
//
// Writes to `focus_discovery_sessions` (migration
// 20260727000001_create_focus_discovery_sessions) — the table's own
// `events` column is a schema-agnostic JSONB log, already shaped
// identically to reading/memory's own sessions tables, so no new
// migration is needed for this sprint's real, different event shapes.
export async function saveFocusDiscoverySession(input: unknown): Promise<FocusDiscoverySessionResult> {
  const parsed = FocusDiscoverySessionInputSchema.safeParse(input)
  if (!parsed.success) {
    logger.warn('focus discovery session input failed validation', { issues: parsed.error.issues })
    return { success: false, error: 'Invalid session data.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: true }
  }

  const { events, completed } = parsed.data

  const { error } = await supabase.from('focus_discovery_sessions').insert({
    user_id: user.id,
    events,
    completed,
  })

  if (error) {
    logger.error('failed to save focus discovery session', { userId: user.id, error: error.message })
    return { success: false, error: 'Could not save your session.' }
  }

  return { success: true }
}
