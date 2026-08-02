import type { ExerciseSequenceItem } from '@/lib/exercises/sequence'
import type { ModuleProgress } from '@/lib/exercises/queries/getModuleProgress'
import type { ReadingIntelligenceExperienceResult } from '@/features/reading-intelligence'
import type { ReadingExerciseQueue, ReadingExerciseQueueItem, ReadingIntelligenceJourney } from './types'

// Shared test-only fixtures for this feature's own test suite — same
// convention as every other src/features/* sprint: independently fixtured,
// never importing another feature's testFixtures.ts, even when re-fixturing
// the same external shape.

export function makeExerciseSequenceItem(overrides: Partial<ExerciseSequenceItem> = {}): ExerciseSequenceItem {
  return {
    exerciseId: 'exercise-1',
    title: 'Exercise 1',
    summary: 'A reading exercise.',
    href: '/labs/quantum-speed-reading/exercise-1',
    ...overrides,
  }
}

export function makeModuleProgress(overrides: Partial<ModuleProgress> = {}): ModuleProgress {
  return {
    statusByExerciseId: { 'exercise-1': 'completed', 'exercise-2': 'not-started' },
    availabilityByExerciseId: { 'exercise-1': 'completed', 'exercise-2': 'current' },
    nextRecommendedExerciseId: 'exercise-2',
    resumeExerciseId: null,
    lastCompletedExerciseId: 'exercise-1',
    completedCount: 1,
    totalCount: 2,
    ...overrides,
  }
}

export function makeReadingExerciseQueueItem(overrides: Partial<ReadingExerciseQueueItem> = {}): ReadingExerciseQueueItem {
  return { exerciseId: 'exercise-1', title: 'Exercise 1', href: '/labs/quantum-speed-reading/exercise-1', status: 'current', ...overrides }
}

export function makeReadingExerciseQueue(overrides: Partial<ReadingExerciseQueue> = {}): ReadingExerciseQueue {
  const items = [makeReadingExerciseQueueItem()]
  return { items, currentItem: items[0]!, remainingCount: 1, ...overrides }
}

export function makeReadingIntelligenceExperienceResult(
  overrides: Partial<ReadingIntelligenceExperienceResult> = {},
): ReadingIntelligenceExperienceResult {
  return {
    journeyState: {
      journey: {
        stages: [
          {
            id: 'core-reading-journey',
            title: 'Core Reading Journey™',
            href: '/labs/quantum-speed-reading/progressive-chunk-reading',
            status: 'current',
            completedCount: 2,
            totalCount: 5,
            actionLabel: 'Continue: Progressive Chunk Reading',
          },
          {
            id: 'reading-intelligence',
            title: 'Reading Intelligence™',
            href: '/labs/quantum-speed-reading/intelligence',
            status: 'locked',
            completedCount: null,
            totalCount: null,
            actionLabel: 'Open',
          },
        ],
        completedStageCount: 0,
        totalStageCount: 2,
        isJourneyComplete: false,
        continueHref: '/labs/quantum-speed-reading/progressive-chunk-reading',
        continueLabel: 'Continue: Core Reading Journey™',
        todaysMissionLabel: 'Core Reading Journey™',
      },
      streak: { currentStreak: 3, bestStreak: 7, lastPracticedDateKey: '2026-07-14' },
      mindScore: 420,
      mindScoreLabel: 'Strong Progress',
    },
    dailyMission: {
      stageId: 'core-reading-journey',
      stageTitle: 'Core Reading Journey™',
      actionLabel: 'Continue: Progressive Chunk Reading',
      continueHref: '/labs/quantum-speed-reading/progressive-chunk-reading',
      isAllDone: false,
    },
    progressSnapshot: {
      stages: [{ stageId: 'core-reading-journey', progress: makeModuleProgress() }],
      overallCompletedCount: 8,
      overallTotalCount: 12,
      overallPercent: 67,
    },
    xp: { totalXp: 85, fromCompletedExercises: 80, fromStreak: 5 },
    validation: { valid: true, issues: [] },
    ...overrides,
  }
}

export function makeReadingIntelligenceJourney(overrides: Partial<ReadingIntelligenceJourney> = {}): ReadingIntelligenceJourney {
  return {
    welcomeTitle: 'Core Reading Journey™',
    missionLabel: 'Core Reading Journey™',
    continueHref: '/labs/quantum-speed-reading/progressive-chunk-reading',
    continueLabel: 'Continue: Core Reading Journey™',
    queue: makeReadingExerciseQueue(),
    progress: {
      stages: [{ stageId: 'core-reading-journey', progress: makeModuleProgress() }],
      overallCompletedCount: 8,
      overallTotalCount: 12,
      overallPercent: 67,
    },
    streak: { currentStreak: 3, bestStreak: 7, lastPracticedDateKey: '2026-07-14' },
    mindScore: 420,
    mindScoreLabel: 'Strong Progress',
    xp: { totalXp: 85, fromCompletedExercises: 80, fromStreak: 5 },
    nextRecommendationLabel: 'Open Reading Intelligence™',
    nextRecommendationHref: '/labs/quantum-speed-reading/intelligence',
    ...overrides,
  }
}
