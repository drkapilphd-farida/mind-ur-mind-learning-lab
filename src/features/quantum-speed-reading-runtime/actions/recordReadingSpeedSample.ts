'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const RecordReadingSpeedSampleInputSchema = z.object({
  documentId: z.string().uuid(),
  mode: z.string().min(1).max(60),
  wpm: z.number().int().min(0).max(2000).nullable(),
})

export type RecordReadingSpeedSampleResult = { success: true } | { success: false; error: string }

// Quantum Speed Reading Experience Engine™ (QSR-E1) — the Observation
// Layer's one real write. Deliberately minimal (document, mode, one real
// WPM number, a timestamp) — "do not overwhelm with analytics. Store
// them internally," per this sprint's own brief. Called at the natural
// end of a real Sprint/Smart Chunk/Speed Ladder reading interval, never
// mid-read. `mode` is typed loosely (`string`, not the full `QsrModeId`
// union) at the wire boundary — the same "validate shape, not exact
// vocabulary" choice `SessionSnapshot.method` already makes one layer
// down — but every real call site in this feature passes a real
// `QsrModeId`.
//
// Quantum Speed Reading Hub Experience™ (Sprint-1) amendment — `wpm` is
// now `number | null`: this same table doubles as the real completion
// log every one of the 6 real modes writes to, backing real "Today's
// Sessions"/"Current Streak" figures. Presence Reading/Guided Eye Flow/
// Comprehension Check call this with `wpm: null` — a real, honest "this
// happened, no WPM applies" record, never a fabricated number.
export async function recordReadingSpeedSample(input: unknown): Promise<RecordReadingSpeedSampleResult> {
  const parsed = RecordReadingSpeedSampleInputSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid reading speed sample.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not signed in.' }

  const { error } = await supabase.from('qsr_reading_speed_samples').insert({
    document_id: parsed.data.documentId,
    user_id: user.id,
    mode: parsed.data.mode,
    wpm: parsed.data.wpm,
  })

  if (error) return { success: false, error: 'Failed to record your reading speed.' }

  return { success: true }
}
