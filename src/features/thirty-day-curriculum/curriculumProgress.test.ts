import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CURRICULUM_PROGRESS_STORAGE_KEY,
  computeBrainDevelopmentScore,
  computeComprehensionAveragePercent,
  computeConsistencyPercent,
  computeReadingGrowthPercent,
  getHighestUnlockedDay,
  isCurriculumDayUnlocked,
  loadCurriculumProgress,
  markCurriculumDayComplete,
  recordCurriculumCheckpoint,
  type CurriculumProgress,
} from './curriculumProgress'

// This suite's default vitest environment is 'node' (see vitest.config.ts),
// so `window`/`localStorage` don't exist unless stubbed — same approach as
// readingLocalHistory.test.ts / sensoryHologramBuilderLocalHistory.test.ts.
let store: Record<string, string>

beforeEach(() => {
  store = {}
  vi.stubGlobal('window', {})
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('loadCurriculumProgress', () => {
  it('returns empty progress when nothing is stored', () => {
    expect(loadCurriculumProgress()).toEqual({ completedDays: [], checkpoints: {} })
  })

  it('ignores corrupted JSON rather than throwing', () => {
    localStorage.setItem(CURRICULUM_PROGRESS_STORAGE_KEY, '{not valid json')
    expect(loadCurriculumProgress()).toEqual({ completedDays: [], checkpoints: {} })
  })
})

describe('markCurriculumDayComplete', () => {
  it('adds a day and persists it', () => {
    markCurriculumDayComplete(1)
    expect(loadCurriculumProgress().completedDays).toEqual([1])
  })

  it('does not duplicate an already-completed day', () => {
    markCurriculumDayComplete(1)
    markCurriculumDayComplete(1)
    expect(loadCurriculumProgress().completedDays).toEqual([1])
  })

  it('keeps completedDays sorted regardless of completion order', () => {
    markCurriculumDayComplete(3)
    markCurriculumDayComplete(1)
    markCurriculumDayComplete(2)
    expect(loadCurriculumProgress().completedDays).toEqual([1, 2, 3])
  })
})

describe('isCurriculumDayUnlocked / getHighestUnlockedDay', () => {
  it('day 1 is always unlocked', () => {
    expect(isCurriculumDayUnlocked(1, { completedDays: [], checkpoints: {} })).toBe(true)
  })

  it('day N unlocks only once day N-1 is complete', () => {
    const progress: CurriculumProgress = { completedDays: [1], checkpoints: {} }
    expect(isCurriculumDayUnlocked(2, progress)).toBe(true)
    expect(isCurriculumDayUnlocked(3, progress)).toBe(false)
  })

  it('getHighestUnlockedDay walks the unbroken completion streak from day 1', () => {
    expect(getHighestUnlockedDay({ completedDays: [1, 2, 3], checkpoints: {} })).toBe(4)
    expect(getHighestUnlockedDay({ completedDays: [1, 3], checkpoints: {} })).toBe(2)
    expect(getHighestUnlockedDay({ completedDays: [], checkpoints: {} })).toBe(1)
  })

  describe('dev/test unlock override (NEXT_PUBLIC_DEV_UNLOCK)', () => {
    afterEach(() => {
      vi.unstubAllEnvs()
    })

    it('unlocks every day, regardless of completion, when the platform-wide dev/test bypass is on', () => {
      vi.stubEnv('NEXT_PUBLIC_DEV_UNLOCK', 'true')
      const emptyProgress: CurriculumProgress = { completedDays: [], checkpoints: {} }
      expect(isCurriculumDayUnlocked(1, emptyProgress)).toBe(true)
      expect(isCurriculumDayUnlocked(15, emptyProgress)).toBe(true)
      expect(isCurriculumDayUnlocked(30, emptyProgress)).toBe(true)
      expect(getHighestUnlockedDay(emptyProgress)).toBe(30)
    })

    it('leaves the real sequential gate untouched when the bypass is off', () => {
      vi.stubEnv('NEXT_PUBLIC_DEV_UNLOCK', 'false')
      const emptyProgress: CurriculumProgress = { completedDays: [], checkpoints: {} }
      expect(isCurriculumDayUnlocked(15, emptyProgress)).toBe(false)
      expect(getHighestUnlockedDay(emptyProgress)).toBe(1)
    })
  })
})

describe('recordCurriculumCheckpoint', () => {
  it('stores the checkpoint result and marks that day complete in one write', () => {
    const next = recordCurriculumCheckpoint({ day: 1, rawWpm: 220, trueWpm: 200, comprehensionAccuracyPercent: 100, completedAt: '2026-01-01T00:00:00.000Z' })
    expect(next.checkpoints[1]?.trueWpm).toBe(200)
    expect(next.completedDays).toEqual([1])
  })
})

describe('computeComprehensionAveragePercent', () => {
  it('returns null with no checkpoints recorded', () => {
    expect(computeComprehensionAveragePercent({ completedDays: [], checkpoints: {} })).toBeNull()
  })

  it('averages every recorded checkpoint', () => {
    const progress: CurriculumProgress = {
      completedDays: [1, 7],
      checkpoints: {
        1: { day: 1, rawWpm: 200, trueWpm: 200, comprehensionAccuracyPercent: 100, completedAt: 'x' },
        7: { day: 7, rawWpm: 240, trueWpm: 216, comprehensionAccuracyPercent: 50, completedAt: 'x' },
      },
    }
    expect(computeComprehensionAveragePercent(progress)).toBe(75)
  })
})

describe('computeReadingGrowthPercent', () => {
  it('returns null with fewer than 2 checkpoints', () => {
    const progress: CurriculumProgress = {
      completedDays: [1],
      checkpoints: { 1: { day: 1, rawWpm: 200, trueWpm: 200, comprehensionAccuracyPercent: 100, completedAt: 'x' } },
    }
    expect(computeReadingGrowthPercent(progress)).toBeNull()
  })

  it('computes real percent growth between the first and latest checkpoint', () => {
    const progress: CurriculumProgress = {
      completedDays: [1, 7],
      checkpoints: {
        1: { day: 1, rawWpm: 200, trueWpm: 200, comprehensionAccuracyPercent: 100, completedAt: 'x' },
        7: { day: 7, rawWpm: 260, trueWpm: 260, comprehensionAccuracyPercent: 100, completedAt: 'x' },
      },
    }
    expect(computeReadingGrowthPercent(progress)).toBe(30)
  })

  it('clamps a regression to 0 rather than showing negative growth', () => {
    const progress: CurriculumProgress = {
      completedDays: [1, 7],
      checkpoints: {
        1: { day: 1, rawWpm: 200, trueWpm: 200, comprehensionAccuracyPercent: 100, completedAt: 'x' },
        7: { day: 7, rawWpm: 150, trueWpm: 150, comprehensionAccuracyPercent: 100, completedAt: 'x' },
      },
    }
    expect(computeReadingGrowthPercent(progress)).toBe(0)
  })
})

describe('computeConsistencyPercent', () => {
  it('is a real fraction of 30 days, never fabricated', () => {
    expect(computeConsistencyPercent({ completedDays: [], checkpoints: {} })).toBe(0)
    expect(computeConsistencyPercent({ completedDays: Array.from({ length: 15 }, (_, i) => i + 1), checkpoints: {} })).toBe(50)
  })
})

describe('computeBrainDevelopmentScore', () => {
  it('returns null until at least 2 checkpoints exist (growth is not yet measurable)', () => {
    const progress: CurriculumProgress = {
      completedDays: [1],
      checkpoints: { 1: { day: 1, rawWpm: 200, trueWpm: 200, comprehensionAccuracyPercent: 100, completedAt: 'x' } },
    }
    expect(computeBrainDevelopmentScore(progress)).toBeNull()
  })

  it('computes the documented 40/30/30 weighted composite once real data exists', () => {
    const progress: CurriculumProgress = {
      completedDays: Array.from({ length: 7 }, (_, i) => i + 1),
      checkpoints: {
        1: { day: 1, rawWpm: 200, trueWpm: 200, comprehensionAccuracyPercent: 100, completedAt: 'x' },
        7: { day: 7, rawWpm: 260, trueWpm: 260, comprehensionAccuracyPercent: 100, completedAt: 'x' },
      },
    }
    // growth = 30, comprehensionAvg = 100, consistency = round(7/30*100) = 23
    // score = round(30*0.4 + 100*0.3 + 23*0.3) = round(12 + 30 + 6.9) = round(48.9) = 49
    const result = computeBrainDevelopmentScore(progress)
    expect(result?.readingGrowthPercent).toBe(30)
    expect(result?.comprehensionAveragePercent).toBe(100)
    expect(result?.consistencyPercent).toBe(23)
    expect(result?.score).toBe(49)
  })
})
