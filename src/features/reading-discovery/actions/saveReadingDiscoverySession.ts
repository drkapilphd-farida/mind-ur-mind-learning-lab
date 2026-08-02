'use server'

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { ReadingDiscoverySessionInputSchema, type ReadingDiscoverySessionResult } from '../types'

// Reading Discovery™ is reachable before sign-in — it's the very first
// screen a new visitor sees. "No user" is therefore the common case, not
// a failure: we silently skip the write rather than reject it, mirroring
// savePracticeSession's posture on the same kind of pre-auth route.
//
// This only records the raw observation log (per-scene dwell time, which
// option was picked, which words were recalled). Nothing here is scored
// or analyzed — that is deliberately out of scope for this sprint.
export async function saveReadingDiscoverySession(input: unknown): Promise<ReadingDiscoverySessionResult> {
  const parsed = ReadingDiscoverySessionInputSchema.safeParse(input)
  if (!parsed.success) {
    logger.warn('reading discovery session input failed validation', { issues: parsed.error.issues })
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

  const { error } = await supabase.from('reading_discovery_sessions').insert({
    user_id: user.id,
    events,
    completed,
  })

  if (error) {
    logger.error('failed to save reading discovery session', { userId: user.id, error: error.message })
    return { success: false, error: 'Could not save your session.' }
  }

  return { success: true }
}
