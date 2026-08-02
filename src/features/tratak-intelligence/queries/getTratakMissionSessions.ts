import { createClient } from '@/lib/supabase/server'
import type { TratakMissionId, TratakMissionSessionRecord } from '../tratakTypes'

// Anonymous-safe: an anonymous visitor gets an empty list, never an error —
// mirrors getFixationSessions.ts. Nothing writes to this table yet in
// Sprint-10A (no exercise engine exists), so every result is honestly
// empty until Sprint-10B ships the real missions.
export async function getTratakMissionSessions(): Promise<readonly TratakMissionSessionRecord[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from('tratak_mission_sessions')
    .select('mission_id, duration_seconds, completed, occurred_at, level_number, analyzer_data, xp_earned')
    .eq('user_id', user.id)
    .order('occurred_at', { ascending: false })

  return (data ?? []).map((row) => ({
    missionId: row.mission_id as TratakMissionId,
    durationSeconds: row.duration_seconds,
    completed: row.completed,
    occurredAt: row.occurred_at,
    levelNumber: row.level_number,
    analyzerData: row.analyzer_data,
    xpEarned: row.xp_earned,
  }))
}
