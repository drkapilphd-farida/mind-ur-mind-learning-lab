import type { ReadingIntelligenceExperienceResult } from '@/features/reading-intelligence'
import type { ReadingPlayerExerciseOutcome, ReadingPlayerSessionSummary } from './types'

// Shared test-only fixtures for this feature's own test suite — same
// convention as every other src/features/* sprint's testFixtures.ts:
// independently fixtured, never importing another feature's testFixtures.ts,
// even when re-fixturing the same external shape (reading-intelligence's
// ReadingIntelligenceExperienceResult). Every builder's defaults are valid
// per this feature's own validator.

export function makeReadingPlayerExerciseOutcome(
  overrides: Partial<ReadingPlayerExerciseOutcome> = {},
): ReadingPlayerExerciseOutcome {
  return { completed: true, durationMs: 45_000, accuracyPercent: 92, ...overrides }
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
        ],
        completedStageCount: 0,
        totalStageCount: 1,
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
      stages: [],
      overallCompletedCount: 8,
      overallTotalCount: 12,
      overallPercent: 67,
    },
    xp: { totalXp: 85, fromCompletedExercises: 80, fromStreak: 5 },
    validation: { valid: true, issues: [] },
    ...overrides,
  }
}

export function makeReadingPlayerSessionSummary(
  overrides: Partial<ReadingPlayerSessionSummary> = {},
): ReadingPlayerSessionSummary {
  return {
    readingScore: 92,
    mindScore: 420,
    mindScoreLabel: 'Strong Progress',
    xp: { totalXp: 85, fromCompletedExercises: 80, fromStreak: 5 },
    continueHref: '/labs/quantum-speed-reading/progressive-chunk-reading',
    continueLabel: 'Continue: Progressive Chunk Reading',
    ...overrides,
  }
}
