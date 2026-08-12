import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  loadBestSensoryHologramBuilderStats,
  recordSensoryHologramBuilderCompletion,
  recordSensoryHologramBuilderEarlyExit,
} from './sensoryHologramBuilderLocalHistory'

describe('sensoryHologramBuilderLocalHistory', () => {
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

  const KEY = 'qsr-sensory-hologram-builder-best'

  it('starts at all-zero when nothing is stored yet', () => {
    expect(loadBestSensoryHologramBuilderStats(KEY)).toEqual({ bestScorePercent: 0, bestStreak: 0 })
  })

  it('records a completion and reflects it in the best stats', () => {
    const result = recordSensoryHologramBuilderCompletion(KEY, 80)
    expect(result.bestScorePercent).toBe(80)
    expect(result.bestStreak).toBe(1)
    expect(result.currentStreak).toBe(1)
    expect(loadBestSensoryHologramBuilderStats(KEY)).toEqual({ bestScorePercent: 80, bestStreak: 1 })
  })

  it('increments the streak across consecutive completions', () => {
    recordSensoryHologramBuilderCompletion(KEY, 60)
    recordSensoryHologramBuilderCompletion(KEY, 60)
    const third = recordSensoryHologramBuilderCompletion(KEY, 60)
    expect(third.currentStreak).toBe(3)
    expect(third.bestStreak).toBe(3)
  })

  it('keeps bestScorePercent as the maximum across attempts, not the latest', () => {
    recordSensoryHologramBuilderCompletion(KEY, 100)
    const second = recordSensoryHologramBuilderCompletion(KEY, 40)
    expect(second.bestScorePercent).toBe(100)
  })

  it('an early exit resets the current streak without touching best-ever values', () => {
    recordSensoryHologramBuilderCompletion(KEY, 100)
    recordSensoryHologramBuilderCompletion(KEY, 100)
    recordSensoryHologramBuilderEarlyExit(KEY)
    const afterExit = recordSensoryHologramBuilderCompletion(KEY, 20)
    expect(afterExit.currentStreak).toBe(1)
    expect(afterExit.bestStreak).toBe(2)
    expect(afterExit.bestScorePercent).toBe(100)
  })

  it('is scoped to its own storage key, independent of other exercises', () => {
    recordSensoryHologramBuilderCompletion(KEY, 80)
    expect(store['qsr-dot-memory-grid-best']).toBeUndefined()
    expect(Object.keys(store)).toEqual([KEY])
  })
})
