import { createClient } from '@/lib/supabase/server'

export type ActiveMasterclass = {
  id: string
  title: string
  description: string
  scheduledAt: string | null
  joinUrl: string | null
  recordingUrl: string | null
  mentorName: string
}

// Member-Exclusive Simplification™ — real, admin-authored rows from the
// `masterclasses` table (see supabase/migrations/
// 20260823000001_create_masterclasses.sql, 20260823162303_add_join_url_
// to_masterclasses.sql). No self-serve authoring UI exists yet, so this
// table is empty until Dr. Kapil Dev Sharma's team adds a session via the
// Supabase dashboard/service role — the /masterclasses hub page's own
// Live Member Training Hub shows an honest empty state when there's
// nothing scheduled, never a fabricated placeholder pretending to be
// real content.
//
// Ordered soonest-first; a session with no date yet (scheduled_at null,
// "date to be announced") sorts last rather than first.
export async function getActiveMasterclasses(): Promise<readonly ActiveMasterclass[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('masterclasses')
    .select('id, title, description, scheduled_at, join_url, recording_url, mentor_name')
    .eq('is_active', true)
    .order('scheduled_at', { ascending: true, nullsFirst: false })

  if (!data) return []

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    scheduledAt: row.scheduled_at,
    joinUrl: row.join_url,
    recordingUrl: row.recording_url,
    mentorName: row.mentor_name,
  }))
}

// A session with a real recording is treated as already having happened
// — the vault. Everything else (no recording yet) is upcoming/current,
// regardless of whether a date or join link has been set yet.
export function splitMasterclassesByStatus(sessions: readonly ActiveMasterclass[]): {
  upcoming: readonly ActiveMasterclass[]
  recorded: readonly ActiveMasterclass[]
} {
  return {
    upcoming: sessions.filter((session) => session.recordingUrl === null),
    recorded: sessions.filter((session) => session.recordingUrl !== null),
  }
}
