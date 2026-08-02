'use server'

// Dev/Test Mode™ — Mandala Tratak™ QA tool. Mirrors devProgressionTools.ts's
// exact precedent: refused outright in production (defense in depth, same
// as the "don't trust a single check" discipline used everywhere else),
// and scoped only to the calling user's own rows for this one mission —
// there is no "target user id" parameter, so this can never touch another
// user's progress.

import { createClient } from '@/lib/supabase/server'
import { completeTratakMissionSession, type CompleteTratakMissionSessionStats } from '@/features/tratak-intelligence/actions/completeTratakMissionSession'
import { getTratakMissionSessions } from '@/features/tratak-intelligence/queries/getTratakMissionSessions'
import { computeMandalaCurrentLevelNumber, computeMandalaLevelProgress, type MandalaLevelOrder } from '@/features/tratak-intelligence/mandalaLevels'
import { MANDALA_OBSERVATION_QUESTIONS } from '@/features/tratak-intelligence/mandalaObservationQuestions'
import type { ImageFixationAnalyzerAnswers } from '@/features/tratak-intelligence/imageFixation/imageFixationReflection'

export type DevMandalaToolResult = { success: true; message: string } | { success: false; error: string }

export type DevCompleteMandalaMissionResult =
  | { success: true; message: string; stats: CompleteTratakMissionSessionStats; xpEarned: number }
  | { success: false; error: string }

// Clearly-labeled synthetic answers — real data flowing through the real
// completeTratakMissionSession pipeline (real scoring, real persistence),
// not a fabricated report. All-correct observation answers are used only
// so "Complete Mission" finishes quickly during QA, not to inflate scores
// dishonestly — the notes field discloses this is synthetic.
const DEV_ANALYZER_ANSWERS: ImageFixationAnalyzerAnswers = {
  gazeStability: 'very-stable',
  afterImageClarity: 'very-clear',
  afterImageDuration: 'more-than-10s',
  centerFocusEase: 'yes',
  notes: 'Dev Test Mode™ — synthetic answer (Complete Mission).',
}

function devCorrectObservationAnswers(levelOrder: MandalaLevelOrder): Record<string, string> {
  const questionSet = MANDALA_OBSERVATION_QUESTIONS[levelOrder]
  return Object.fromEntries(questionSet.questions.map((question) => [question.id, question.correctOptionId]))
}

// Completes every remaining Mandala Tratak™ level in sequence via the real
// save action — never inserts rows directly, so the resulting Visual
// Intelligence Report™ is exactly as real as one produced by a human
// session, just with disclosed synthetic input.
export async function devCompleteMandalaMission(): Promise<DevCompleteMandalaMissionResult> {
  if (process.env.NODE_ENV === 'production') {
    return { success: false, error: 'Dev tools are not available in production.' }
  }

  let currentLevelOrder = computeMandalaCurrentLevelNumber(computeMandalaLevelProgress(await getTratakMissionSessions()))
  if (currentLevelOrder === null) {
    return { success: false, error: 'Mission is already fully complete.' }
  }

  let stats: CompleteTratakMissionSessionStats | null = null
  let xpEarned = 0
  let iterations = 0

  while (currentLevelOrder !== null && iterations < 5) {
    const result = await completeTratakMissionSession({
      missionId: 'mandala-persistence',
      durationSeconds: 60,
      reflectionResponse: null,
      observationNotes: null,
      analyzerAnswers: DEV_ANALYZER_ANSWERS,
      observationAnswers: devCorrectObservationAnswers(currentLevelOrder),
      levelNumber: currentLevelOrder,
      imageId: null,
      measuredAfterImageDurationSeconds: null,
    })

    if (!result.success) {
      return { success: false, error: result.error }
    }

    stats = result.stats
    xpEarned = result.xpEarned
    currentLevelOrder = result.stats.mandalaCurrentLevelNumber
    iterations += 1
  }

  if (stats === null) {
    return { success: false, error: 'Mission is already fully complete.' }
  }

  return { success: true, message: 'Mandala Tratak™ mission completed with synthetic Dev Test Mode™ answers.', stats, xpEarned }
}

export async function devResetMandalaTratakMission(): Promise<DevMandalaToolResult> {
  if (process.env.NODE_ENV === 'production') {
    return { success: false, error: 'Dev tools are not available in production.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Not signed in.' }

  const { error } = await supabase
    .from('tratak_mission_sessions')
    .delete()
    .eq('user_id', user.id)
    .eq('mission_id', 'mandala-persistence')

  if (error) {
    return { success: false, error: `Failed to reset: ${error.message}` }
  }

  return { success: true, message: 'Mandala Tratak™ progress reset — Level 1 is unlocked again.' }
}
