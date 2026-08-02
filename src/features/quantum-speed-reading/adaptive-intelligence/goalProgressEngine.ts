// Goal Progress — Sprint 4. Each of the 6 goals maps to real profile/session
// stats against disclosed milestone targets — never a fabricated percentage.

import type { ReadingGoalId, ReadingProfile, ReadingSessionRecord } from './readingIntelligenceTypes'

function progressToward(value: number, target: number): number {
  if (target <= 0) return 0
  return Math.min(100, Math.round((value / target) * 100))
}

const PROFESSIONAL_CATEGORIES = new Set(['business', 'technology'])

export function computeGoalProgress(
  goalId: ReadingGoalId,
  profile: ReadingProfile,
  sessions: readonly ReadingSessionRecord[],
): number {
  const completed = sessions.filter((s) => s.completed)

  switch (goalId) {
    case 'academic-excellence': {
      // Comprehension/accuracy toward a 90% mastery bar.
      const accuracyProgress = progressToward(profile.averageAccuracy, 90)
      const comprehensionProgress = progressToward(profile.averageComprehension, 90)
      return Math.round((accuracyProgress + comprehensionProgress) / 2)
    }
    case 'faster-reading': {
      // Toward a 300 WPM milestone.
      return progressToward(profile.averageWpm, 300)
    }
    case 'better-comprehension': {
      // Toward a 95% comprehension milestone.
      return progressToward(profile.averageComprehension, 95)
    }
    case 'professional-reading': {
      // Consistent practice in work-relevant categories (Business/Technology),
      // toward a target of 40% of all sessions, plus overall accuracy.
      const professionalCount = completed.filter((s) => PROFESSIONAL_CATEGORIES.has(s.category)).length
      const professionalShare = completed.length > 0 ? (professionalCount / completed.length) * 100 : 0
      const shareProgress = progressToward(professionalShare, 40)
      const accuracyProgress = progressToward(profile.averageAccuracy, 85)
      return Math.round((shareProgress + accuracyProgress) / 2)
    }
    case 'book-reading-mastery': {
      // Session-count stamina (toward 30 sessions) plus a strong average score.
      const sessionProgress = progressToward(profile.sessionsCompleted, 30)
      const scoreProgress = progressToward(profile.averageReadingScore, 85)
      return Math.round((sessionProgress + scoreProgress) / 2)
    }
    case 'competitive-exam-prep': {
      // Balanced speed + accuracy under real exam-relevant targets.
      const wpmProgress = progressToward(profile.averageWpm, 280)
      const accuracyProgress = progressToward(profile.averageAccuracy, 90)
      return Math.round((wpmProgress + accuracyProgress) / 2)
    }
    default:
      return 0
  }
}
