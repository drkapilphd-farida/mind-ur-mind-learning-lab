'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { recommendQsrMode } from '../../presentation/recommendQsrMode'
import { resolveReadingStyle } from '../resolveReadingStyle'

const StageResultInputSchema = z.object({
  stage: z.enum(['word-chunk', 'phrase-chunk', 'sentence', 'paragraph']),
  chunkNodeId: z.string().min(1),
  selfSelectedPace: z.enum(['slow', 'comfortable', 'fast']),
  // Clamped, not rejected: a very short document can force the same passage
  // across multiple stages (see selectAssessmentPassages.ts's single-chunk
  // fallback), and a fast re-read of already-seen text can legitimately
  // compute past 2000wpm. Rejecting the whole assessment here would
  // permanently strand that learner with no way to retry successfully.
  wpm: z.number().int().min(0).transform((value) => Math.min(value, 2000)),
  readingTimeMs: z.number().int().min(0),
  questionCount: z.number().int().min(0),
  correctCount: z.number().int().min(0),
})

const SaveReadingAssessmentInputSchema = z.object({
  documentId: z.string().uuid(),
  stageResults: z.array(StageResultInputSchema).min(1).max(4),
})

export type SaveReadingAssessmentResult = { success: true } | { success: false; error: string }

// Reading Assessment Engine™ — Step 6, "AI Analysis." Deliberately fully
// deterministic, zero new Claude calls: `comprehension_percent` and
// `accuracy_percent` are written from the one real measured quantity
// (correct ÷ total questions) — the same honest precedent
// `reading_intelligence_sessions`' own migration already established,
// never two independently-measured signals. "Recommended Starting
// Point" reuses `recommendQsrMode()` verbatim, fed this assessment's own
// real measured average WPM — zero new recommendation logic. Upserts
// (never appends) — a fresh assessment replaces the prior Reading
// Profile for this document, matching the table's own real, current-
// profile shape (see the migration's own comment).
export async function saveReadingAssessment(input: unknown): Promise<SaveReadingAssessmentResult> {
  const parsed = SaveReadingAssessmentInputSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid assessment results.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not signed in.' }

  const stageResults = parsed.data.stageResults.map((result) => {
    const comprehensionPercent = result.questionCount > 0 ? Math.round((result.correctCount / result.questionCount) * 100) : 0
    return { ...result, comprehensionPercent, accuracyPercent: comprehensionPercent }
  })

  const paragraphStage = stageResults.find((result) => result.stage === 'paragraph')
  const overallWpm = paragraphStage?.wpm ?? Math.round(stageResults.reduce((sum, result) => sum + result.wpm, 0) / stageResults.length)

  const readingStyle = resolveReadingStyle(stageResults.map((result) => ({ stage: result.stage, wpm: result.wpm, comprehensionPercent: result.comprehensionPercent })))
  const recommendation = recommendQsrMode({ averageWpm: overallWpm, pauseCount: 0 })

  const { error } = await supabase.from('qsr_reading_assessments').upsert(
    {
      document_id: parsed.data.documentId,
      user_id: user.id,
      stage_results: stageResults,
      overall_wpm: overallWpm,
      reading_style: readingStyle,
      recommended_mode: recommendation.modeId,
      recommendation_reason: recommendation.reason,
      completed_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,document_id' },
  )

  if (error) return { success: false, error: 'Failed to save your reading assessment.' }

  return { success: true }
}
