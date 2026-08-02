'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const GetReadingSpeedHistoryInputSchema = z.object({
  documentId: z.string().uuid(),
})

export type ReadingSpeedSample = {
  mode: string
  // `null` for a real completion with no WPM measurement (Presence
  // Reading/Guided Eye Flow/Comprehension Check) — see
  // recordReadingSpeedSample.ts's own comment. Speed Ladder-style WPM
  // consumers must filter these out; "Today's Sessions"-style completion
  // counts should count every row regardless.
  wpm: number | null
  recordedAt: string
}

export type GetReadingSpeedHistoryResult = { success: true; samples: readonly ReadingSpeedSample[] } | { success: false; error: string }

// Quantum Speed Reading Experience Engine™ (QSR-E1) — Speed Ladder™'s own
// real read path. Every real sample this learner has ever recorded for
// this real document, most recent first — Speed Ladder derives Current/
// Best/Level entirely from this real history (never a fabricated
// starting number), and the AI Recommendation Layer reuses the same real
// average for its own WPM signal — one real read, two real consumers.
// Quantum Speed Reading Hub Experience™ (Sprint-1) — also the real source
// for "Today's Sessions" (every completion, WPM or not, recorded today).
export async function getReadingSpeedHistory(input: unknown): Promise<GetReadingSpeedHistoryResult> {
  const parsed = GetReadingSpeedHistoryInputSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid request.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not signed in.' }

  const { data, error } = await supabase
    .from('qsr_reading_speed_samples')
    .select('mode, wpm, recorded_at')
    .eq('user_id', user.id)
    .eq('document_id', parsed.data.documentId)
    .order('recorded_at', { ascending: false })

  if (error) return { success: false, error: 'Failed to load your reading speed history.' }

  return { success: true, samples: (data ?? []).map((row) => ({ mode: row.mode, wpm: row.wpm, recordedAt: row.recorded_at })) }
}
