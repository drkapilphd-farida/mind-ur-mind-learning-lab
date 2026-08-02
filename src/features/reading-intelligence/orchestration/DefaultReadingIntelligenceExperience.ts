import { EYE_FOUNDATION_MODULE } from '@/features/quantum-speed-reading/eyeFoundationModule'
import { READING_EXPANSION_MODULE } from '@/features/quantum-speed-reading/readingExpansionModule'
import { VISUAL_ACTIVATION_EXERCISE_IDS, VISUAL_ACTIVATION_SEQUENCE } from '@/features/visual-intelligence/visualActivationSequence'
import { getContinueLearningSummary } from '@/lib/exercises/continueLearning'
import { computeJourneyProgress, type JourneyExerciseStage } from '@/lib/exercises/journeyProgress'
import { computeMindScore, computeReadingScore, getMindScoreLabel } from '@/lib/exercises/mindScore'
import { computeDailyStreak } from '@/lib/exercises/practiceHistory'
import { getModuleProgress } from '@/lib/exercises/queries/getModuleProgress'
import { getPracticeSessions } from '@/lib/exercises/queries/getPracticeSessions'
import { buildReadingDailyMission } from '../dailyMission'
import { buildReadingJourneyState } from '../journey'
import { buildReadingProgressSnapshot } from '../progress'
import type { ReadingIntelligenceExperienceResult } from '../types'
import { validateReadingIntelligenceExperienceResult } from '../validation'
import { computeReadingXp } from '../xp'
import type { ReadingIntelligenceExperience } from './ReadingIntelligenceExperience'

const EYE_FOUNDATION_EXERCISE_IDS = EYE_FOUNDATION_MODULE.map((exercise) => exercise.exerciseId)
const READING_EXPANSION_EXERCISE_IDS = READING_EXPANSION_MODULE.map((exercise) => exercise.exerciseId)

// The one dependency seam this feature injects: the two real, async,
// Supabase-backed reads. Every other reused function below (computeJourneyProgress,
// getContinueLearningSummary, computeDailyStreak, computeReadingScore,
// computeMindScore, getMindScoreLabel) is a pure, deterministic, already-tested
// production function — calling it directly in tests is reuse, not something
// to stub.
export type ReadingIntelligenceDataSource = {
  getModuleProgress: typeof getModuleProgress
  getPracticeSessions: typeof getPracticeSessions
}

function createDefaultDataSource(): ReadingIntelligenceDataSource {
  return { getModuleProgress, getPracticeSessions }
}

// The ONLY file in this feature that calls real production functions
// directly — mirrors Sprint 41's (ai-runtime-orchestrator) precedent of
// confining real cross-boundary calls to one coordinator file. Every stage's
// exercise-id catalog (VISUAL_ACTIVATION_SEQUENCE, EYE_FOUNDATION_MODULE,
// READING_EXPANSION_MODULE) is the same real, unmodified configuration data
// app/labs/quantum-speed-reading/page.tsx already imports for the identical
// purpose — not new coupling, not duplicated logic.
//
// SPRINT-2A — Quantum Speed Reading Library Cleanup™. Flash Intelligence
// Pack™ removed as an active journey stage (kept in the repo, unlinked from
// Version-1 navigation) — Reading Preparation™ and Core Reading Journey™ are
// now parallel, optional branches after Visual Activation rather than a
// strict Visual Activation → Reading Preparation → Flash → Core chain.
export class DefaultReadingIntelligenceExperience implements ReadingIntelligenceExperience {
  constructor(private readonly dataSource: ReadingIntelligenceDataSource) {}

  async load(): Promise<ReadingIntelligenceExperienceResult> {
    const { getModuleProgress: fetchModuleProgress, getPracticeSessions: fetchPracticeSessions } = this.dataSource

    const [visualActivationProgress, readingPreparationProgress, coreReadingJourneyProgress, sessions] = await Promise.all([
      fetchModuleProgress('visual-intelligence', VISUAL_ACTIVATION_EXERCISE_IDS),
      fetchModuleProgress('quantum-speed-reading', EYE_FOUNDATION_EXERCISE_IDS),
      fetchModuleProgress('quantum-speed-reading', READING_EXPANSION_EXERCISE_IDS),
      fetchPracticeSessions('quantum-speed-reading'),
    ])

    const visualActivationSummary = getContinueLearningSummary(visualActivationProgress, VISUAL_ACTIVATION_SEQUENCE)
    const readingPreparationSummary = getContinueLearningSummary(readingPreparationProgress, EYE_FOUNDATION_MODULE)
    const coreReadingJourneySummary = getContinueLearningSummary(coreReadingJourneyProgress, READING_EXPANSION_MODULE)

    const exerciseStages: JourneyExerciseStage[] = [
      {
        id: 'visual-activation',
        title: 'Visual Activation™',
        href: visualActivationSummary.currentExercise?.href ?? '/labs/visual-intelligence/visual-activation',
        summary: visualActivationSummary,
      },
      {
        id: 'reading-preparation',
        title: 'Reading Preparation™',
        href: '/labs/quantum-speed-reading/preparation',
        summary: readingPreparationSummary,
      },
      {
        id: 'core-reading-journey',
        title: 'Core Reading Journey™',
        href: coreReadingJourneySummary.currentExercise?.href ?? '/labs/quantum-speed-reading/phrase-reading',
        summary: coreReadingJourneySummary,
      },
    ]

    const journey = computeJourneyProgress(exerciseStages, {
      id: 'reading-intelligence',
      title: 'Reading Intelligence™',
      href: '/labs/quantum-speed-reading/intelligence',
    })

    // Mirrors app/labs/quantum-speed-reading/page.tsx's own Mind Score
    // computation exactly (stage-level completion percent), so this stays
    // faithful to existing behavior once wired into a real page.
    const streak = computeDailyStreak(sessions)
    const overallStagePercent = Math.round((journey.completedStageCount / journey.totalStageCount) * 100)
    const readingScore = computeReadingScore(overallStagePercent, streak.currentStreak)
    const mindScore = computeMindScore([readingScore])
    const mindScoreLabel = getMindScoreLabel(mindScore).label

    const journeyState = buildReadingJourneyState(journey, streak, mindScore, mindScoreLabel)
    const dailyMission = buildReadingDailyMission(journey)
    const progressSnapshot = buildReadingProgressSnapshot([
      { stageId: 'visual-activation', progress: visualActivationProgress },
      { stageId: 'reading-preparation', progress: readingPreparationProgress },
      { stageId: 'core-reading-journey', progress: coreReadingJourneyProgress },
    ])
    const xp = computeReadingXp(progressSnapshot.overallCompletedCount, streak.currentStreak)

    const draftResult: ReadingIntelligenceExperienceResult = {
      journeyState,
      dailyMission,
      progressSnapshot,
      xp,
      validation: { valid: true, issues: [] },
    }

    return { ...draftResult, validation: validateReadingIntelligenceExperienceResult(draftResult) }
  }
}

export function createReadingIntelligenceExperience(
  overrides: Partial<ReadingIntelligenceDataSource> = {},
): ReadingIntelligenceExperience {
  return new DefaultReadingIntelligenceExperience({ ...createDefaultDataSource(), ...overrides })
}
