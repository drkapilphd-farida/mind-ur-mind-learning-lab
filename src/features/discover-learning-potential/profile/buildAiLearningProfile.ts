import { createClient } from '@/lib/supabase/server'
import { deriveAiLearningProfile, type DiscoverySessionRow } from './deriveAiLearningProfile'
import type { AiLearningProfile } from '../types'

async function fetchStageRows(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, table: 'reading_discovery_sessions' | 'memory_discovery_sessions' | 'focus_discovery_sessions'): Promise<readonly DiscoverySessionRow[]> {
  const { data } = await supabase.from(table).select('completed, occurred_at').eq('user_id', userId).order('occurred_at', { ascending: false })
  return data ?? []
}

// AI Learning Profile — Sprint-1's real, server-side read path. Reads
// this signed-in learner's own real rows from the three
// `*_discovery_sessions` tables (honestly empty for an anonymous
// visitor — both existing tables already silently skip anonymous writes,
// and `focus_discovery_sessions` now mirrors that). `learnerType` is
// always `null` here — the real "Myself/My Child" selection lives only
// in client-side Zustand state (`useDiscoveryFlowStore`), which a Server
// Component genuinely cannot read; a page that wants personalized copy
// reads the store directly, client-side, alongside this real data,
// rather than this function guessing at it.
export async function buildAiLearningProfile(userId: string | null): Promise<AiLearningProfile> {
  if (!userId) return deriveAiLearningProfile(null, [], [], [])

  const supabase = await createClient()
  const [readingRows, memoryRows, focusRows] = await Promise.all([
    fetchStageRows(supabase, userId, 'reading_discovery_sessions'),
    fetchStageRows(supabase, userId, 'memory_discovery_sessions'),
    fetchStageRows(supabase, userId, 'focus_discovery_sessions'),
  ])

  return deriveAiLearningProfile(null, readingRows, memoryRows, focusRows)
}
