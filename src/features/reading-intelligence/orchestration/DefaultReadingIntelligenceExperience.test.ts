import { describe, expect, it } from 'vitest'
import type { ModuleProgress } from '@/lib/exercises/queries/getModuleProgress'
import type { PracticeSessionRecord } from '@/lib/exercises/queries/getPracticeSessions'
import { makeModuleProgress, makePracticeSessionRecord } from '../testFixtures'
import { createReadingIntelligenceExperience, type ReadingIntelligenceDataSource } from './DefaultReadingIntelligenceExperience'

function makeStubDataSource(overrides: Partial<ReadingIntelligenceDataSource> = {}): ReadingIntelligenceDataSource {
  return {
    getModuleProgress: async (): Promise<ModuleProgress> => makeModuleProgress({ completedCount: 0, totalCount: 2 }),
    getPracticeSessions: async (): Promise<PracticeSessionRecord[]> => [],
    ...overrides,
  }
}

describe('DefaultReadingIntelligenceExperience', () => {
  it('Streaming Lifecycle / Reading Lab Happy Path: a fully-completed set of stages surfaces the Reading Intelligence terminal stage as the daily mission', async () => {
    const experience = createReadingIntelligenceExperience(
      makeStubDataSource({
        getModuleProgress: async (): Promise<ModuleProgress> => makeModuleProgress({ completedCount: 2, totalCount: 2 }),
        getPracticeSessions: async (): Promise<PracticeSessionRecord[]> => [
          makePracticeSessionRecord({ occurredAt: new Date().toISOString(), completed: true }),
        ],
      }),
    )

    const result = await experience.load()

    expect(result.validation).toEqual({ valid: true, issues: [] })
    expect(result.dailyMission.stageId).toBe('reading-intelligence')
    expect(result.dailyMission.stageTitle).toBe('Reading Intelligence™')
    expect(result.dailyMission.continueHref).toBe('/labs/quantum-speed-reading/intelligence')
    expect(result.progressSnapshot.overallCompletedCount).toBe(4)
    expect(result.progressSnapshot.overallTotalCount).toBe(4)
    expect(result.journeyState.streak.currentStreak).toBe(1)
    expect(result.xp).toEqual({ totalXp: 45, fromCompletedExercises: 40, fromStreak: 5 })
  })

  it('New Learner: an all-zero, no-history state still produces a valid, well-formed result', async () => {
    const experience = createReadingIntelligenceExperience(makeStubDataSource())

    const result = await experience.load()

    expect(result.validation).toEqual({ valid: true, issues: [] })
    expect(result.progressSnapshot.overallCompletedCount).toBe(0)
    expect(result.journeyState.streak).toEqual({ currentStreak: 0, bestStreak: 0, lastPracticedDateKey: null })
    expect(result.xp).toEqual({ totalXp: 0, fromCompletedExercises: 0, fromStreak: 0 })
    expect(result.dailyMission.stageId).toBe('reading-preparation')
  })

  it('Progress Tracking: calls getModuleProgress once per real Reading Lab stage', async () => {
    const calledLabIds: string[] = []
    const experience = createReadingIntelligenceExperience(
      makeStubDataSource({
        getModuleProgress: async (labId): Promise<ModuleProgress> => {
          calledLabIds.push(labId)
          return makeModuleProgress()
        },
      }),
    )

    await experience.load()

    expect(calledLabIds).toEqual(['quantum-speed-reading', 'quantum-speed-reading'])
  })

  it('Determinism: two independently-constructed experiences produce identical results for identical stub data', async () => {
    const dataSource = makeStubDataSource()
    const experienceA = createReadingIntelligenceExperience(dataSource)
    const experienceB = createReadingIntelligenceExperience(dataSource)

    const [resultA, resultB] = await Promise.all([experienceA.load(), experienceB.load()])

    expect(resultA).toEqual(resultB)
  })
})
