'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { getTratakMissionSessions } from '../queries/getTratakMissionSessions'
import {
  computeTratakCurrentMissionId,
  computeTratakJourneyProgressPercent,
  computeTratakLevel,
  computeTratakMissionProgress,
  computeTratakXp,
  type TratakMission,
} from '../tratakMissionEngine'
import { computeTratakStreak } from '../tratakStreak'
import { computeTratakPersistenceScore } from '../tratakPersistenceScore'
import { computeTratakFocusScore, difficultyToRatio } from '../tratakFocusScore'
import { TRATAK_MISSION_BY_ID } from '../tratakMissions'
import type { TratakMissionId } from '../tratakTypes'
import {
  computeMandalaCurrentLevelNumber,
  computeMandalaLevelProgress,
  computeMandalaLevelXpEarned,
  isMandalaMissionFullyComplete,
  type MandalaLevel,
  type MandalaLevelOrder,
} from '../mandalaLevels'
import { computeVisualAnalytics, type VisualAnalytics } from '../imageFixation/visualAnalytics'
import { GAZE_STABILITY_RATIO, AFTER_IMAGE_DURATION_RATIO, computeAfterImageDurationRatioFromSeconds } from '../imageFixation/imageFixationReflection'
import { computeAttentionScore, computeObservationAccuracy, computeVisualRecall, type ObservationQuestionSet } from '../imageFixation/observationScoring'
import { generateVisualIntelligenceRecommendation, type VisualIntelligenceScores } from '../imageFixation/visualIntelligenceRecommendation'
import { MANDALA_OBSERVATION_QUESTIONS } from '../mandalaObservationQuestions'
import { IMAGE_PERSISTENCE_OBSERVATION_QUESTIONS } from '../imagePersistenceObservationQuestions'
import { CANDLE_TRATAK_OBSERVATION_QUESTIONS } from '../candleTratakObservationQuestions'
import { IMAGE_PERSISTENCE_IMAGE_POOL } from '../imagePersistencePool'
import { DAILY_IMAGE_COUNT } from '../imagePersistenceDailySequence'
import { computeDailyPersistenceReport, type DailyImageSessionSummary, type DailyPersistenceReport } from '../dailyPersistenceReport'
import { getNeuralEvolutionOverallScore } from '../queries/getNeuralEvolutionOverallScore'

const AnalyzerAnswersSchema = z
  .object({
    // Sprint 10F enhancement: nullable — Image Persistence Challenge™'s and
    // Candle Tratak™'s simplified reflection no longer ask these 2
    // questions. Mandala Tratak™'s screen still always supplies both, so
    // its stored shape/scores are unchanged.
    gazeStability: z.enum(['very-stable', 'mostly-stable', 'frequently-drifted', 'could-not-maintain']).nullable(),
    afterImageClarity: z.enum(['very-clear', 'moderate', 'faint', 'none']),
    afterImageDuration: z.enum(['more-than-10s', '5-10s', 'less-than-5s', 'not-observed']),
    centerFocusEase: z.enum(['yes', 'sometimes', 'difficult']).nullable(),
    notes: z.string().nullable(),
  })
  .strict()

// Generic across all Tratak missions (mirrors completeFixationSession.ts's
// one-action-for-N-exercise-types shape) — Mandala Tratak™ and Image
// Persistence Challenge™ both reuse this unchanged. Every Sprint-10A engine
// called here (computeTratakMissionProgress, computeTratakXp,
// computeTratakLevel, computeTratakStreak, computeTratakPersistenceScore,
// computeTratakJourneyProgressPercent) is read-only reuse — none modified.
const CompleteTratakMissionSessionInputSchema = z
  .object({
    missionId: z.enum(['mandala-persistence', 'candle-tratak', 'image-persistence-challenge']),
    durationSeconds: z.number().min(0),
    // Sprint 10B's simple 1-question reflection — superseded by
    // analyzerAnswers below for Mandala Tratak™, kept for backward
    // compatibility with the original one-shot shape.
    reflectionResponse: z.enum(['clear-afterimage', 'brief-afterimage', 'colors-only', 'no-afterimage']).nullable(),
    observationNotes: z.string().nullable(),
    // Sprint 10D: the Intelligent Focus Analyzer™'s 4 structured answers.
    analyzerAnswers: AnalyzerAnswersSchema.nullable(),
    // Sprint 10E: Observation Intelligence™'s real per-question answers
    // (questionId -> selectedOptionId), scored against mandalaObservationQuestions.ts
    // or imagePersistenceObservationQuestions.ts depending on which of
    // levelNumber/imageId is set.
    observationAnswers: z.record(z.string(), z.string()).nullable(),
    // Sprint 10C: set for missions with sub-levels (Mandala Tratak™'s 5
    // levels). null for a mission with no level structure.
    levelNumber: z.number().int().min(1).max(5).nullable(),
    // Sprint 10F: set for Image Persistence Challenge™ (the Adaptive Random
    // Image Engine™'s picked image id). null for every other mission.
    imageId: z.string().nullable(),
    // Sprint 10F enhancement: the REAL measured after-image duration (2-tap
    // timer) in seconds — set for Image Persistence Challenge™ and Candle
    // Tratak™, null for Mandala Tratak™ (which still only self-reports the
    // duration bucket directly).
    measuredAfterImageDurationSeconds: z.number().min(0).nullable(),
  })
  .strict()

export type CompleteTratakMissionSessionInput = z.infer<typeof CompleteTratakMissionSessionInputSchema>

export type CompleteTratakMissionSessionStats = {
  missions: readonly TratakMission[]
  xp: number
  level: number
  currentStreak: number
  persistenceScore: number
  focusScore: number
  journeyProgressPercent: number
  currentMissionId: TratakMissionId | null
  // Sprint 10C: populated only when missionId is 'mandala-persistence'.
  mandalaLevels: readonly MandalaLevel[]
  mandalaLevelXpEarned: number
  mandalaCurrentLevelNumber: MandalaLevelOrder | null
  isMandalaMissionFullyComplete: boolean
  // Sprint 10D: populated only when analyzerAnswers was provided.
  visualAnalytics: VisualAnalytics | null
  // Sprint 10E: populated only when both analyzerAnswers and
  // observationAnswers were provided for a leveled mission.
  visualIntelligenceReport: VisualIntelligenceReport | null
  // Real lab-wide Neural Evolution Index™, refetched fresh after this save
  // — always populated, cheap to compute, harmless for missions that don't
  // display it.
  neuralEvolutionOverallScore: number
  // Sprint 10F architecture refinement: populated only when
  // missionId === 'image-persistence-challenge' and this was the 5th real
  // image of the day — the one combined report shown instead of five.
  dailyPersistenceReport: DailyPersistenceReport | null
}

export type VisualIntelligenceReport = VisualIntelligenceScores & {
  recommendation: string
}

export type CompleteTratakMissionSessionResult =
  | { success: true; stats: CompleteTratakMissionSessionStats; xpEarned: number }
  | { success: false; error: string }

const ZERO_STATS: CompleteTratakMissionSessionStats = {
  missions: [],
  xp: 0,
  level: 1,
  currentStreak: 0,
  persistenceScore: 0,
  focusScore: 0,
  journeyProgressPercent: 0,
  currentMissionId: 'candle-tratak',
  mandalaLevels: [],
  mandalaLevelXpEarned: 0,
  mandalaCurrentLevelNumber: 1,
  isMandalaMissionFullyComplete: false,
  visualAnalytics: null,
  visualIntelligenceReport: null,
  neuralEvolutionOverallScore: 0,
  dailyPersistenceReport: null,
}

function highestDifficultyRatio(missions: readonly TratakMission[]): number {
  return missions
    .filter((mission) => mission.status === 'completed')
    .reduce((max, mission) => Math.max(max, difficultyToRatio(TRATAK_MISSION_BY_ID[mission.id].difficulty)), 0)
}

export async function completeTratakMissionSession(input: unknown): Promise<CompleteTratakMissionSessionResult> {
  const parsed = CompleteTratakMissionSessionInputSchema.safeParse(input)
  if (!parsed.success) {
    logger.warn('tratak mission session input failed validation', { issues: parsed.error.issues })
    return { success: false, error: 'Invalid session data.' }
  }

  // Sprint 10F refinement: 'mandala-persistence' is no longer in
  // TRATAK_MISSION_BY_ID's backing array (retired from the roadmap, route
  // left intact) — falls back to 0 XP rather than throwing. Every other
  // mission id is always present.
  const xpReward = TRATAK_MISSION_BY_ID[parsed.data.missionId as TratakMissionId]?.xpReward ?? 0
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Anonymous-safe: nothing is tracked, so nothing is fabricated.
  if (!user) {
    return { success: true, stats: ZERO_STATS, xpEarned: xpReward }
  }

  // Sprint 10F refinement: "is this the last real unit for this mission"
  // now genuinely differs per mission — Mandala keeps its exact original
  // 5-level logic (untouched); Candle Tratak™ is always single-shot; Image
  // Persistence Challenge™ is final on the 5th real image of the day
  // (levelNumber is always 1-5 for this mission now, never null).
  const isFinalStep =
    parsed.data.missionId === 'mandala-persistence'
      ? parsed.data.levelNumber === null || parsed.data.levelNumber === 5
      : parsed.data.missionId === 'candle-tratak'
        ? true
        : parsed.data.levelNumber === DAILY_IMAGE_COUNT

  // Visual Analytics™ must be computed BEFORE the insert (this table has no
  // UPDATE RLS policy — an insert-then-update was tried during QA and
  // silently persisted only the raw answers, RLS quietly discarding the
  // update). Computed from the real pre-insert history plus this
  // submission's own known values, then written in the single insert below
  // — a historical snapshot of this specific session's honest self-report,
  // not a continuously-recomputed rolling score.
  // Sprint 10F enhancement: a real, precisely-measured 0-1 duration ratio
  // from the 2-tap timer — preferred over the coarser self-reported bucket
  // whenever present (Image Persistence Challenge™, Candle Tratak™).
  // Mandala Tratak™ never sends this, so it's always null there.
  const measuredAfterImageDurationRatio =
    parsed.data.measuredAfterImageDurationSeconds !== null ? computeAfterImageDurationRatioFromSeconds(parsed.data.measuredAfterImageDurationSeconds) : null

  let visualAnalytics: VisualAnalytics | null = null
  let priorMandalaLevels: readonly MandalaLevel[] = []
  if (parsed.data.analyzerAnswers !== null) {
    const priorSessions = await getTratakMissionSessions()

    let completedLevelsCount: number
    let totalLevelsCount: number
    let totalDurationSeconds: number

    if (parsed.data.missionId === 'mandala-persistence') {
      priorMandalaLevels = computeMandalaLevelProgress(priorSessions)
      const priorCompletedMandalaLevelsCount = priorMandalaLevels.filter((level) => level.status === 'completed').length
      const isNewlyCompletedLevel = priorMandalaLevels.find((level) => level.order === parsed.data.levelNumber)?.status !== 'completed'
      const priorMandalaDurationSeconds = priorSessions
        .filter((session) => session.missionId === 'mandala-persistence')
        .reduce((sum, session) => sum + session.durationSeconds, 0)

      completedLevelsCount = priorCompletedMandalaLevelsCount + (isNewlyCompletedLevel ? 1 : 0)
      totalLevelsCount = Math.max(priorMandalaLevels.length, 5)
      totalDurationSeconds = priorMandalaDurationSeconds + parsed.data.durationSeconds
    } else if (parsed.data.missionId === 'image-persistence-challenge') {
      // "Breadth" for a leveled mission maps to "breadth of today's 5-image
      // sequence completed so far" — the real position (1-5) within today.
      completedLevelsCount = parsed.data.levelNumber ?? 1
      totalLevelsCount = DAILY_IMAGE_COUNT
      const priorImagePersistenceDurationSeconds = priorSessions
        .filter((session) => session.missionId === 'image-persistence-challenge')
        .reduce((sum, session) => sum + session.durationSeconds, 0)
      totalDurationSeconds = priorImagePersistenceDurationSeconds + parsed.data.durationSeconds
    } else {
      // Candle Tratak™: single-shot, no breadth concept — always "fully at
      // milestone" the instant it's done. Lifetime duration still tracked
      // honestly across repeat sessions for Visual Endurance™.
      const priorCandleDurationSeconds = priorSessions
        .filter((session) => session.missionId === 'candle-tratak')
        .reduce((sum, session) => sum + session.durationSeconds, 0)
      completedLevelsCount = 1
      totalLevelsCount = 1
      totalDurationSeconds = priorCandleDurationSeconds + parsed.data.durationSeconds
    }

    visualAnalytics = computeVisualAnalytics({
      gazeStability: parsed.data.analyzerAnswers.gazeStability,
      afterImageClarity: parsed.data.analyzerAnswers.afterImageClarity,
      afterImageDuration: parsed.data.analyzerAnswers.afterImageDuration,
      centerFocusEase: parsed.data.analyzerAnswers.centerFocusEase,
      completedLevelsCount,
      totalLevelsCount,
      totalDurationSeconds,
      measuredAfterImageDurationRatio,
    })
  }

  // Visual Intelligence Report™ (Sprint 10E, generalized further in this
  // refinement) — real objective Observation Intelligence™ accuracy
  // blended with the real self-reported ratios already available above.
  // fixationStability/afterImageAwareness are reused as-is from Visual
  // Analytics™, never recomputed differently. Every image/level still gets
  // its own real per-unit report computed and stored — Image Persistence
  // Challenge™ simply isn't SHOWN one until the 5th image (see
  // dailyPersistenceReport below).
  let visualIntelligenceReport: VisualIntelligenceReport | null = null
  if (parsed.data.analyzerAnswers !== null && parsed.data.observationAnswers !== null && visualAnalytics !== null) {
    const questionSet: ObservationQuestionSet | null =
      parsed.data.missionId === 'mandala-persistence' && parsed.data.levelNumber !== null
        ? MANDALA_OBSERVATION_QUESTIONS[parsed.data.levelNumber as MandalaLevelOrder]
        : parsed.data.missionId === 'candle-tratak' && parsed.data.imageId !== null
          ? (CANDLE_TRATAK_OBSERVATION_QUESTIONS[parsed.data.imageId] ?? null)
          : parsed.data.missionId === 'image-persistence-challenge' && parsed.data.imageId !== null
            ? (IMAGE_PERSISTENCE_OBSERVATION_QUESTIONS[parsed.data.imageId] ?? null)
            : null

    if (questionSet !== null) {
      const observationAccuracy = computeObservationAccuracy(questionSet, parsed.data.observationAnswers)
      const durationRatio = measuredAfterImageDurationRatio ?? AFTER_IMAGE_DURATION_RATIO[parsed.data.analyzerAnswers.afterImageDuration]
      // Attention Score™ needs a "held focus" ratio — Mandala Tratak™'s
      // real gaze-stability self-report when available; otherwise (the
      // simplified flow) honestly re-derived from the real measured
      // duration ratio, same reformulation as Fixation Stability™ above.
      const gazeRatio = parsed.data.analyzerAnswers.gazeStability !== null ? GAZE_STABILITY_RATIO[parsed.data.analyzerAnswers.gazeStability] : durationRatio

      const scores: VisualIntelligenceScores = {
        observationAccuracy,
        fixationStability: visualAnalytics.fixationStability,
        afterImageAwareness: visualAnalytics.afterImageAwareness,
        attentionScore: computeAttentionScore(gazeRatio, observationAccuracy),
        visualRecall: computeVisualRecall(observationAccuracy, durationRatio),
      }

      if (parsed.data.missionId === 'mandala-persistence') {
        // The real next level (or null once the mission is complete) —
        // reuses the same pre-insert history fetched for Visual Analytics
        // above, no extra query.
        const nextLevelOrder = computeMandalaCurrentLevelNumber(priorMandalaLevels)
        const recommendationNextLevel = isFinalStep ? null : nextLevelOrder
        visualIntelligenceReport = {
          ...scores,
          recommendation: generateVisualIntelligenceRecommendation(
            scores,
            recommendationNextLevel !== null ? `Level ${recommendationNextLevel}` : null,
            'You have completed all 5 levels of Mandala Tratak™ — well done.',
          ),
        }
      } else if (parsed.data.missionId === 'candle-tratak') {
        visualIntelligenceReport = {
          ...scores,
          recommendation: generateVisualIntelligenceRecommendation(scores, null, 'Well done — Candle Tratak™ complete. Come back anytime for another round.'),
        }
      } else {
        // Image Persistence Challenge™: still a real per-image
        // recommendation (used internally / by the dev panel), even though
        // the user only ever sees the day-5 aggregate recommendation.
        const nextImageNumber = isFinalStep ? null : (parsed.data.levelNumber ?? 0) + 1
        visualIntelligenceReport = {
          ...scores,
          recommendation: generateVisualIntelligenceRecommendation(
            scores,
            nextImageNumber !== null ? `Image ${nextImageNumber} of ${DAILY_IMAGE_COUNT}` : null,
            "Today's Challenge Complete — come back tomorrow for a fresh set of images.",
          ),
        }
      }
    }
  }

  const imagePersistenceCategory = parsed.data.imageId !== null ? (IMAGE_PERSISTENCE_IMAGE_POOL.find((image) => image.id === parsed.data.imageId)?.category ?? null) : null

  const { error } = await supabase.from('tratak_mission_sessions').insert({
    user_id: user.id,
    mission_id: parsed.data.missionId,
    duration_seconds: Math.round(parsed.data.durationSeconds),
    reflection_response: parsed.data.reflectionResponse,
    observation_notes: parsed.data.observationNotes,
    analyzer_data:
      parsed.data.analyzerAnswers !== null
        ? {
            answers: parsed.data.analyzerAnswers,
            analytics: visualAnalytics,
            observationAnswers: parsed.data.observationAnswers,
            report: visualIntelligenceReport,
            ...(parsed.data.imageId !== null ? { imagePersistence: { imageId: parsed.data.imageId, category: imagePersistenceCategory } } : {}),
          }
        : null,
    xp_earned: parsed.data.levelNumber !== null ? 50 : xpReward,
    level_number: parsed.data.levelNumber,
    completed: isFinalStep,
  })

  if (error) {
    logger.warn('failed to log tratak mission session', { error: error.message })
    return { success: false, error: 'Failed to save session.' }
  }

  const [sessions, neuralEvolutionOverallScore] = await Promise.all([getTratakMissionSessions(), getNeuralEvolutionOverallScore()])
  const missions = computeTratakMissionProgress(sessions)
  const streak = computeTratakStreak(sessions)
  const completedMissionCount = missions.filter((mission) => mission.status === 'completed').length
  const totalDurationSeconds = sessions.reduce((sum, session) => sum + (session.completed ? session.durationSeconds : 0), 0)

  // Sprint 10F refinement: on the 5th real image of the day, combine
  // today's 5 real stored per-image reports into the one aggregate the
  // user actually sees — reads back the row just inserted above, never a
  // second fabricated computation.
  let dailyPersistenceReport: DailyPersistenceReport | null = null
  if (parsed.data.missionId === 'image-persistence-challenge' && isFinalStep) {
    const todayKey = new Date().toISOString().slice(0, 10)
    const todaysSummaries: DailyImageSessionSummary[] = sessions
      .filter((session) => session.missionId === 'image-persistence-challenge' && session.occurredAt.slice(0, 10) === todayKey)
      .map((session): DailyImageSessionSummary | null => {
        if (typeof session.analyzerData !== 'object' || session.analyzerData === null) return null
        const report = (session.analyzerData as Record<string, unknown>).report
        if (typeof report !== 'object' || report === null) return null
        return { report: report as VisualIntelligenceReport, xpEarned: session.xpEarned }
      })
      .filter((summary): summary is DailyImageSessionSummary => summary !== null)

    dailyPersistenceReport = computeDailyPersistenceReport(todaysSummaries)
  }

  const stats: CompleteTratakMissionSessionStats = {
    missions,
    xp: computeTratakXp(missions),
    level: computeTratakLevel(missions),
    currentStreak: streak.currentStreak,
    persistenceScore: computeTratakPersistenceScore({
      completedMissionCount,
      totalMissionCount: missions.length,
      currentStreak: streak.currentStreak,
      totalDurationSeconds,
    }),
    focusScore: computeTratakFocusScore({
      completedMissionCount,
      totalMissionCount: missions.length,
      currentStreak: streak.currentStreak,
      totalDurationSeconds,
      highestDifficultyRatio: highestDifficultyRatio(missions),
    }),
    journeyProgressPercent: computeTratakJourneyProgressPercent(missions),
    currentMissionId: computeTratakCurrentMissionId(missions),
    mandalaLevels: computeMandalaLevelProgress(sessions),
    mandalaLevelXpEarned: computeMandalaLevelXpEarned(computeMandalaLevelProgress(sessions)),
    mandalaCurrentLevelNumber: computeMandalaCurrentLevelNumber(computeMandalaLevelProgress(sessions)),
    isMandalaMissionFullyComplete: isMandalaMissionFullyComplete(computeMandalaLevelProgress(sessions)),
    visualAnalytics,
    visualIntelligenceReport,
    neuralEvolutionOverallScore,
    dailyPersistenceReport,
  }

  return { success: true, stats, xpEarned: parsed.data.levelNumber !== null ? 50 : xpReward }
}
