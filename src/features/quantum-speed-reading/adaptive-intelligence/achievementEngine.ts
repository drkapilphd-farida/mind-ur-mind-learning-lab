// Achievement unlock-checking — Sprint 4. Pure function against the fixed
// catalog + real computed profile/personal-bests, entirely data-driven via
// each definition's `metric` field — no per-achievement special-casing.

import { ACHIEVEMENT_CATALOG } from './achievementCatalog'
import type { ReadingProfile, PersonalBests, UnlockedAchievement, AchievementMetric } from './readingIntelligenceTypes'

function metricValue(metric: AchievementMetric, profile: ReadingProfile, bests: PersonalBests): number {
  switch (metric) {
    case 'sessionsCompleted':
      return profile.sessionsCompleted
    case 'bestAccuracy':
      return bests.bestAccuracy ?? 0
    case 'bestComprehension':
      return bests.bestComprehension ?? 0
    case 'highestWpm':
      return bests.highestWpm ?? 0
    case 'longestStreak':
      return bests.longestStreak
  }
}

export function computeUnlockedAchievements(profile: ReadingProfile, bests: PersonalBests): readonly UnlockedAchievement[] {
  return ACHIEVEMENT_CATALOG.map((definition) => {
    const value = metricValue(definition.metric, profile, bests)
    const progressToward = definition.threshold > 0 ? Math.min(1, value / definition.threshold) : 0
    return { ...definition, unlocked: value >= definition.threshold, progressToward }
  })
}
