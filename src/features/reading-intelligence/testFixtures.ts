import type { JourneyProgress, JourneyStageView } from '@/lib/exercises/journeyProgress'
import type { DailyStreak } from '@/lib/exercises/practiceHistory'
import type { ModuleProgress } from '@/lib/exercises/queries/getModuleProgress'
import type { PracticeSessionRecord } from '@/lib/exercises/queries/getPracticeSessions'
import type { ExerciseAccess } from '@/lib/exercises/queries/getExerciseAccess'
import type { ReadingIntelligenceExperienceResult, ReadingJourneyState, ReadingProgressSnapshot, ReadingXp } from './types'

// Shared test-only fixtures for this feature's own test suite — same
// convention as every other src/features/* sprint's testFixtures.ts. Not
// itself a *.test.ts file, so vitest's `include` glob never picks it up.
// Every builder's defaults are valid per this feature's own validator, so
// tests only need to override the one field under test. Fixture shapes
// mirror the real, unmodified types from src/lib/exercises/* — this file
// does not reimplement or duplicate any of that logic, only fabricates
// deterministic sample data of the same shape for tests.

export function makeJourneyStageView(overrides: Partial<JourneyStageView> = {}): JourneyStageView {
  return {
    id: 'core-reading-journey',
    title: 'Core Reading Journey™',
    href: '/labs/quantum-speed-reading/progressive-chunk-reading',
    status: 'current',
    completedCount: 2,
    totalCount: 5,
    actionLabel: 'Continue: Progressive Chunk Reading',
    ...overrides,
  }
}

export function makeJourneyProgress(overrides: Partial<JourneyProgress> = {}): JourneyProgress {
  const stages = [makeJourneyStageView()]
  return {
    stages,
    completedStageCount: 0,
    totalStageCount: stages.length,
    isJourneyComplete: false,
    continueHref: stages[0]!.href,
    continueLabel: `Continue: ${stages[0]!.title}`,
    todaysMissionLabel: stages[0]!.title,
    ...overrides,
  }
}

export function makeDailyStreak(overrides: Partial<DailyStreak> = {}): DailyStreak {
  return { currentStreak: 3, bestStreak: 7, lastPracticedDateKey: '2026-07-14', ...overrides }
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

export function makePracticeSessionRecord(overrides: Partial<PracticeSessionRecord> = {}): PracticeSessionRecord {
  return {
    exerciseId: 'exercise-1',
    durationMs: 60_000,
    completed: true,
    occurredAt: '2026-07-14T08:00:00.000Z',
    ...overrides,
  }
}

export function makeExerciseAccess(overrides: Partial<ExerciseAccess> = {}): ExerciseAccess {
  return { allowed: true, ...overrides } as ExerciseAccess
}

export function makeReadingXp(overrides: Partial<ReadingXp> = {}): ReadingXp {
  return { totalXp: 25, fromCompletedExercises: 20, fromStreak: 5, ...overrides }
}

export function makeReadingJourneyState(overrides: Partial<ReadingJourneyState> = {}): ReadingJourneyState {
  return {
    journey: makeJourneyProgress(),
    streak: makeDailyStreak(),
    mindScore: 420,
    mindScoreLabel: 'Strong Progress',
    ...overrides,
  }
}

export function makeReadingProgressSnapshot(overrides: Partial<ReadingProgressSnapshot> = {}): ReadingProgressSnapshot {
  return {
    stages: [{ stageId: 'core-reading-journey', progress: makeModuleProgress() }],
    overallCompletedCount: 1,
    overallTotalCount: 2,
    overallPercent: 50,
    ...overrides,
  }
}

export function makeReadingIntelligenceExperienceResult(
  overrides: Partial<ReadingIntelligenceExperienceResult> = {},
): ReadingIntelligenceExperienceResult {
  return {
    journeyState: makeReadingJourneyState(),
    dailyMission: {
      stageId: 'core-reading-journey',
      stageTitle: 'Core Reading Journey™',
      actionLabel: 'Continue: Progressive Chunk Reading',
      continueHref: '/labs/quantum-speed-reading/progressive-chunk-reading',
      isAllDone: false,
    },
    progressSnapshot: makeReadingProgressSnapshot(),
    xp: makeReadingXp(),
    validation: { valid: true, issues: [] },
    ...overrides,
  }
}
