'use server'

import { createClient } from '@/lib/supabase/server'

export type SyncCurriculumDayCompletionInput = {
  day: number
  rawWpm?: number
  trueWpm?: number
  comprehensionAccuracyPercent?: number
}

// Two-Pillar Simplification™ — write-through mirror of curriculumProgress.ts's
// localStorage completion record, purely so a Parents Dashboard (read
// server-side, often from a different device than the student's) can see
// real "Daily Curriculum Progress." Never the source of truth for
// gating/unlocking — that stays entirely in curriculumProgress.ts,
// unchanged. Fire-and-forget from the client (see DayMasterPlayer.tsx,
// curriculumReturnRouting.ts, ThirtyDayCurriculumExperience.tsx): a
// failure here must never block or delay the student's own real progress.
export async function syncCurriculumDayCompletion(input: SyncCurriculumDayCompletionInput): Promise<void> {
  // Every call site fires this without awaiting (real progress must never
  // wait on or be blocked by this mirror write) — so any failure here,
  // including in a test environment with no real Supabase context, must
  // never surface as an unhandled rejection. Silent no-op on failure,
  // same posture as every other fire-and-forget side-channel call in
  // this app (e.g. logSelectionExplanationCost).
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    await supabase.from('curriculum_day_completions').upsert(
      {
        user_id: user.id,
        day: input.day,
        raw_wpm: input.rawWpm ?? null,
        true_wpm: input.trueWpm ?? null,
        comprehension_accuracy_percent: input.comprehensionAccuracyPercent ?? null,
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,day' },
    )
  } catch {
    // Fire-and-forget mirror write — never block or surface an error to
    // the caller for a real progress action.
  }
}
