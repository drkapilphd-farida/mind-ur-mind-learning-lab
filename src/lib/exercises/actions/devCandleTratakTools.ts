'use server'

// Dev/Test Mode™ — Candle Tratak™ QA tool. Mirrors devMandalaTratakTools.ts /
// devImagePersistenceTools.ts's exact precedent: refused outright in
// production, real save pipeline with disclosed synthetic input — never a
// direct insert.

import { completeTratakMissionSession, type CompleteTratakMissionSessionStats } from '@/features/tratak-intelligence/actions/completeTratakMissionSession'
import { CANDLE_TRATAK_OBSERVATION_QUESTIONS } from '@/features/tratak-intelligence/candleTratakObservationQuestions'
import { CANDLE_TRATAK_IMAGE } from '@/features/tratak-intelligence/candleTratakImage'
import type { ImageFixationAnalyzerAnswers } from '@/features/tratak-intelligence/imageFixation/imageFixationReflection'

export type DevCompleteCandleTratakSessionResult =
  | { success: true; message: string; stats: CompleteTratakMissionSessionStats; xpEarned: number }
  | { success: false; error: string }

// Sprint 10F enhancement: matches the real simplified reflection flow —
// gaze-stability/center-focus-ease are no longer asked, so real users
// never supply them either; the duration bucket below is derived from the
// same disclosed synthetic 12s used for measuredAfterImageDurationSeconds.
const DEV_ANALYZER_ANSWERS: ImageFixationAnalyzerAnswers = {
  gazeStability: null,
  afterImageClarity: 'very-clear',
  afterImageDuration: 'more-than-10s',
  centerFocusEase: null,
  notes: 'Dev Test Mode™ — synthetic answer (Generate Report).',
}

function devCorrectObservationAnswers(): Record<string, string> {
  const questionSet = CANDLE_TRATAK_OBSERVATION_QUESTIONS[CANDLE_TRATAK_IMAGE.id]
  if (questionSet === undefined) return {}
  return Object.fromEntries(questionSet.questions.map((question) => [question.id, question.correctOptionId]))
}

export async function devCompleteCandleTratakSession(): Promise<DevCompleteCandleTratakSessionResult> {
  if (process.env.NODE_ENV === 'production') {
    return { success: false, error: 'Dev tools are not available in production.' }
  }

  const result = await completeTratakMissionSession({
    missionId: 'candle-tratak',
    durationSeconds: 65,
    reflectionResponse: null,
    observationNotes: null,
    analyzerAnswers: DEV_ANALYZER_ANSWERS,
    observationAnswers: devCorrectObservationAnswers(),
    levelNumber: null,
    imageId: CANDLE_TRATAK_IMAGE.id,
    measuredAfterImageDurationSeconds: 12,
  })

  if (!result.success) {
    return { success: false, error: result.error }
  }

  return { success: true, message: 'Candle Tratak™ session completed with synthetic Dev Test Mode™ answers.', stats: result.stats, xpEarned: result.xpEarned }
}
