import { describe, expect, it } from 'vitest'
import { mergeDashboardAchievements } from './dashboardAchievements'
import type { UnlockedAchievement } from '../adaptive/types/adaptiveTypes'
import type { DnaAchievement } from '../dna/dnaTypes'

describe('mergeDashboardAchievements', () => {
  it('returns 14 total achievements from 7 + 7 real inputs, with unique ids', () => {
    const adaptive: UnlockedAchievement[] = Array.from({ length: 7 }, (_, i) => ({
      id: `a${i}`,
      title: `Adaptive ${i}`,
      description: 'desc',
      unlocked: false,
      progressToward: 0,
    }))
    const dna: DnaAchievement[] = Array.from({ length: 7 }, (_, i) => ({
      id: `d${i}`,
      title: `Dna ${i}`,
      description: 'desc',
      unlocked: false,
      progressToward: 0,
      trackable: true,
    }))

    const merged = mergeDashboardAchievements(adaptive, dna)
    expect(merged).toHaveLength(14)
    const ids = new Set(merged.map((a) => a.id))
    expect(ids.size).toBe(14)
  })

  it('preserves the trackable flag distinction between the two sources', () => {
    const merged = mergeDashboardAchievements(
      [{ id: 'x', title: 'X', description: 'd', unlocked: true, progressToward: 1 }],
      [{ id: 'y', title: 'Y', description: 'd', unlocked: false, progressToward: 0, trackable: false }],
    )
    expect(merged.find((a) => a.source === 'adaptive')!.trackable).toBe(true)
    expect(merged.find((a) => a.source === 'dna')!.trackable).toBe(false)
  })
})
