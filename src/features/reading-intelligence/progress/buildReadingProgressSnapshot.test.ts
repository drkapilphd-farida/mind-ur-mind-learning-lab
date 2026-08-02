import { describe, expect, it } from 'vitest'
import { makeModuleProgress } from '../testFixtures'
import { buildReadingProgressSnapshot } from './buildReadingProgressSnapshot'

describe('buildReadingProgressSnapshot', () => {
  it('Progress Tracking: aggregates completed/total counts and percent across stages', () => {
    const stages = [
      { stageId: 'stage-a', progress: makeModuleProgress({ completedCount: 2, totalCount: 2 }) },
      { stageId: 'stage-b', progress: makeModuleProgress({ completedCount: 1, totalCount: 4 }) },
    ]

    const snapshot = buildReadingProgressSnapshot(stages)

    expect(snapshot).toEqual({
      stages,
      overallCompletedCount: 3,
      overallTotalCount: 6,
      overallPercent: 50,
    })
  })

  it('returns 0 percent for an empty stage list without dividing by zero', () => {
    expect(buildReadingProgressSnapshot([])).toEqual({
      stages: [],
      overallCompletedCount: 0,
      overallTotalCount: 0,
      overallPercent: 0,
    })
  })

  it('Determinism: identical inputs produce identical output', () => {
    const stages = [{ stageId: 'stage-a', progress: makeModuleProgress() }]

    expect(buildReadingProgressSnapshot(stages)).toEqual(buildReadingProgressSnapshot(stages))
  })
})
