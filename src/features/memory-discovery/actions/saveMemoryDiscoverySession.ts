'use server'

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { MemoryDiscoverySessionInputSchema, type MemoryDiscoverySessionResult } from '../types'

// Memory Discovery™ is reachable before sign-in, same as Reading
// Discovery — "no user" is the common case, not a failure: we silently
// skip the write rather than reject it.
//
// This only records the raw observation log (per-scene dwell time, which
// option was picked, which items were recalled). Nothing here is scored
// or analyzed — that is deliberately out of scope for this sprint.
export async function saveMemoryDiscoverySession(input: unknown): Promise<MemoryDiscoverySessionResult> {
  const parsed = MemoryDiscoverySessionInputSchema.safeParse(input)
  if (!parsed.success) {
    logger.warn('memory discovery session input failed validation', { issues: parsed.error.issues })
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

  const { error } = await supabase.from('memory_discovery_sessions').insert({
    user_id: user.id,
    events,
    completed,
  })

  if (error) {
    logger.error('failed to save memory discovery session', { userId: user.id, error: error.message })
    return { success: false, error: 'Could not save your session.' }
  }

  return { success: true }
}
