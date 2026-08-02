'use server'

// Dev/Test Mode™ — Image Persistence Challenge™ QA tool. Mirrors
// devMandalaTratakTools.ts / devCandleTratakTools.ts's exact precedent:
// refused outright in production, real save pipeline with disclosed
// synthetic input — never a direct insert.

import { createClient } from '@/lib/supabase/server'
import { completeTratakMissionSession, type CompleteTratakMissionSessionStats } from '@/features/tratak-intelligence/actions/completeTratakMissionSession'
import { getTodaysImagePersistenceSequence } from '@/features/tratak-intelligence/queries/getTodaysImagePersistenceSequence'
import { IMAGE_PERSISTENCE_OBSERVATION_QUESTIONS } from '@/features/tratak-intelligence/imagePersistenceObservationQuestions'
import { DAILY_IMAGE_COUNT } from '@/features/tratak-intelligence/imagePersistenceDailySequence'
import type { ImageFixationAnalyzerAnswers } from '@/features/tratak-intelligence/imageFixation/imageFixationReflection'

export type DevCompleteImagePersistenceSequenceResult =
  | { success: true; message: string; stats: CompleteTratakMissionSessionStats; xpEarned: number }
  | { success: false; error: string }

export type DevResetTodaysProgressResult = { success: true; message: string } | { success: false; error: string }

// Sprint 10F enhancement: matches the real simplified reflection flow —
// gaze-stability/center-focus-ease are no longer asked, so real users
// never supply them either.
const DEV_ANALYZER_ANSWERS: ImageFixationAnalyzerAnswers = {
  gazeStability: null,
  afterImageClarity: 'very-clear',
  afterImageDuration: 'more-than-10s',
  centerFocusEase: null,
  notes: 'Dev Test Mode™ — synthetic answer (Complete Today’s Sequence).',
}

function devCorrectObservationAnswers(imageId: string): Record<string, string> {
  const questionSet = IMAGE_PERSISTENCE_OBSERVATION_QUESTIONS[imageId]
  if (questionSet === undefined) return {}
  return Object.fromEntries(questionSet.questions.map((question) => [question.id, question.correctOptionId]))
}

// Completes however many of today's 5 real images remain, via the real
// save pipeline (disclosed synthetic answers) — reuses the exact same
// deterministic daily sequence a real session would use.
export async function devCompleteTodaysSequence(): Promise<DevCompleteImagePersistenceSequenceResult> {
  if (process.env.NODE_ENV === 'production') {
    return { success: false, error: 'Dev tools are not available in production.' }
  }

  const { sequence, todaysCompletedCount } = await getTodaysImagePersistenceSequence()
  if (todaysCompletedCount >= DAILY_IMAGE_COUNT) {
    return { success: false, error: "Today's 5 images are already complete." }
  }

  let stats: CompleteTratakMissionSessionStats | null = null
  let xpEarned = 0

  for (let position = todaysCompletedCount + 1; position <= DAILY_IMAGE_COUNT; position++) {
    const image = sequence[position - 1]
    if (image === undefined) break

    const result = await completeTratakMissionSession({
      missionId: 'image-persistence-challenge',
      durationSeconds: 65,
      reflectionResponse: null,
      observationNotes: null,
      analyzerAnswers: DEV_ANALYZER_ANSWERS,
      observationAnswers: devCorrectObservationAnswers(image.id),
      levelNumber: position,
      imageId: image.id,
      measuredAfterImageDurationSeconds: 12,
    })

    if (!result.success) {
      return { success: false, error: result.error }
    }

    stats = result.stats
    xpEarned = result.xpEarned
  }

  if (stats === null) {
    return { success: false, error: "Today's 5 images are already complete." }
  }

  return { success: true, message: "Today's Image Persistence Challenge™ sequence completed with synthetic Dev Test Mode™ answers.", stats, xpEarned }
}

// Deletes only TODAY's rows for this mission (reuses the existing
// table-wide DELETE RLS policy) so QA can retest the daily cap without
// waiting for UTC midnight — never touches other days' or other missions'
// real history.
export async function devResetTodaysProgress(): Promise<DevResetTodaysProgressResult> {
  if (process.env.NODE_ENV === 'production') {
    return { success: false, error: 'Dev tools are not available in production.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Not signed in.' }

  const todayKey = new Date().toISOString().slice(0, 10)
  const { error } = await supabase
    .from('tratak_mission_sessions')
    .delete()
    .eq('user_id', user.id)
    .eq('mission_id', 'image-persistence-challenge')
    .gte('occurred_at', `${todayKey}T00:00:00.000Z`)

  if (error) {
    return { success: false, error: `Failed to reset: ${error.message}` }
  }

  return { success: true, message: "Today's Image Persistence Challenge™ progress reset." }
}
