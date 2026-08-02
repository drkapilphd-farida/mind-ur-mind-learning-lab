// Visual Intelligence Lab™ — Visual Intelligence Dashboard™, Sprint 9.
// Rather than inventing a third achievement set, this merges and displays
// both existing ones (Sprint-7's computeAchievements + Sprint-8's
// computeDnaAchievements) through one shared display shape — no new
// unlock logic, purely a normalizer over already-computed real results.

import type { UnlockedAchievement } from '../adaptive/types/adaptiveTypes'
import type { DnaAchievement } from '../dna/dnaTypes'

export type DashboardAchievement = {
  id: string
  title: string
  description: string
  unlocked: boolean
  progressToward: number
  trackable: boolean
  source: 'adaptive' | 'dna'
}

export function mergeDashboardAchievements(
  adaptiveAchievements: readonly UnlockedAchievement[],
  dnaAchievements: readonly DnaAchievement[],
): readonly DashboardAchievement[] {
  const fromAdaptive: DashboardAchievement[] = adaptiveAchievements.map((achievement) => ({
    id: `adaptive-${achievement.id}`,
    title: achievement.title,
    description: achievement.description,
    unlocked: achievement.unlocked,
    progressToward: achievement.progressToward,
    trackable: true,
    source: 'adaptive',
  }))

  const fromDna: DashboardAchievement[] = dnaAchievements.map((achievement) => ({
    id: `dna-${achievement.id}`,
    title: achievement.title,
    description: achievement.description,
    unlocked: achievement.unlocked,
    progressToward: achievement.progressToward,
    trackable: achievement.trackable,
    source: 'dna',
  }))

  return [...fromAdaptive, ...fromDna]
}
