import { createClient } from '@/lib/supabase/server'

export type ActiveMasterclass = {
  id: string
  title: string
  description: string
  scheduledAt: string | null
  recordingUrl: string | null
  mentorName: string
}

// Dynamic Live Masterclass Backend™ (Phase 5) — real, admin-authored rows
// from the new `masterclasses` table (see supabase/migrations/
// 20260823000001_create_masterclasses.sql). No self-serve authoring UI
// exists yet, so this table is empty until Dr. Kapil Dev Sharma's team
// adds a session via the Supabase dashboard/service role — the
// /masterclasses hub page's own fallback (its existing enrollment +
// waitlist cards) covers that empty state honestly, never a fabricated
// "no classes yet" placeholder pretending to be real content.
//
// Ordered soonest-first; a session with no date yet (scheduled_at null,
// "date to be announced") sorts last rather than first.
export async function getActiveMasterclasses(): Promise<readonly ActiveMasterclass[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('masterclasses')
    .select('id, title, description, scheduled_at, recording_url, mentor_name')
    .eq('is_active', true)
    .order('scheduled_at', { ascending: true, nullsFirst: false })

  if (!data) return []

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    scheduledAt: row.scheduled_at,
    recordingUrl: row.recording_url,
    mentorName: row.mentor_name,
  }))
}
