import type { ReadingIntelligenceExperienceResult } from '@/features/reading-intelligence'
import type { ReadingIntelligenceJourney } from '@/features/reading-intelligence-journey'
import type { ReadingNextRecommendation, ReadingSessionStatus } from './types'

// Shared test-only fixtures for this feature's own test suite — same
// convention as every other src/features/* sprint: independently fixtured,
// never importing another feature's testFixtures.ts, even when re-fixturing
// the same external shape.

export function makeReadingIntelligenceExperienceResult(
  overrides: Partial<ReadingIntelligenceExperienceResult> = {},
): ReadingIntelligenceExperienceResult {
  return {
    journeyState: {
      journey: {
        stages: [
          {
            id: 'flash-intelligence-pack',
            title: 'Flash Intelligence Pack™',
            href: '/labs/quantum-speed-reading/word-flash',
            status: 'complete',
            completedCount: 2,
            totalCount: 2,
            actionLabel: 'Continue: Word Flash',
          },
          {
            id: 'core-reading-journey',
            title: 'Core Reading Journey™',
            href: '/labs/quantum-speed-reading/progressive-chunk-reading',
            status: 'current',
            completedCount: 1,
            totalCount: 3,
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
        completedStageCount: 1,
        totalStageCount: 3,
        isJourneyComplete: false,
        continueHref: '/labs/quantum-speed-reading/progressive-chunk-reading',
        continueLabel: 'Continue: Core Reading Journey™',
        todaysMissionLabel: 'Core Reading Journey™',
      },
      streak: { currentStreak: 4, bestStreak: 9, lastPracticedDateKey: '2026-07-14' },
      mindScore: 540,
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
      overallCompletedCount: 3,
      overallTotalCount: 5,
      overallPercent: 60,
    },
    xp: { totalXp: 55, fromCompletedExercises: 30, fromStreak: 20 },
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
    queue: { items: [], currentItem: null, remainingCount: 0 },
    progress: { stages: [], overallCompletedCount: 3, overallTotalCount: 5, overallPercent: 60 },
    streak: { currentStreak: 4, bestStreak: 9, lastPracticedDateKey: '2026-07-14' },
    mindScore: 540,
    mindScoreLabel: 'Strong Progress',
    xp: { totalXp: 55, fromCompletedExercises: 30, fromStreak: 20 },
    nextRecommendationLabel: 'Open Reading Intelligence™',
    nextRecommendationHref: '/labs/quantum-speed-reading/intelligence',
    ...overrides,
  }
}

export function makeReadingSessionStatus(overrides: Partial<ReadingSessionStatus> = {}): ReadingSessionStatus {
  return {
    stageLabel: 'Core Reading Journey™',
    stagePosition: { index: 2, total: 3 },
    exerciseLabel: 'Continue: Progressive Chunk Reading',
    isComplete: false,
    ...overrides,
  }
}

export function makeReadingNextRecommendation(overrides: Partial<ReadingNextRecommendation> = {}): ReadingNextRecommendation {
  return {
    label: 'Open Reading Intelligence™',
    href: '/labs/quantum-speed-reading/intelligence',
    stageTitle: 'Core Reading Journey™',
    ...overrides,
  }
}
