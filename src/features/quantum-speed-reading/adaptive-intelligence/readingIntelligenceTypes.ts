// Adaptive Intelligence Engine™ — Sprint 4 of Quantum Speed Reading™.
// Shared types for the reading_intelligence_sessions table and everything
// computed from it. Self-contained — never imported by Sprint 1-3.

import type { PassageCategory } from '../passageLibrary'
import type { PassageDifficulty } from '../passageDifficulty'

export type ReadingSessionRecord = {
  id: string
  passageId: string
  category: PassageCategory
  difficulty: PassageDifficulty
  mode: string | null
  wpm: number
  readingTimeMs: number
  comprehensionPercent: number
  accuracyPercent: number
  readingIntelligenceScore: number
  focusMode: boolean
  hintsUsed: number
  completed: boolean
  occurredAt: string // ISO timestamp
}

export type ReadingGoalId =
  | 'academic-excellence'
  | 'faster-reading'
  | 'better-comprehension'
  | 'professional-reading'
  | 'book-reading-mastery'
  | 'competitive-exam-prep'

export type GoalDefinition = {
  id: ReadingGoalId
  title: string
  description: string
}

export type ReadingProfile = {
  averageWpm: number
  averageAccuracy: number
  averageComprehension: number
  averageReadingScore: number
  bestCategory: PassageCategory | null
  weakestCategory: PassageCategory | null
  currentDifficulty: PassageDifficulty | null
  sessionsCompleted: number
  currentStreak: number
  longestStreak: number
  totalReadingTimeMs: number
  lastReadingDate: string | null // date key, e.g. "2026-07-04"
}

// "Reading Style" | "Visual Processing" | "Reading Strategy" | "Focus Pattern"
// | "Difficulty Comfort" | "Category Preference" — each dimension resolves to
// exactly one label today, always paired with a confidence score that grows
// with session count. Never a permanent label from one session: confidence
// is recomputed fresh from the full history every time, never stored/mutated.
export type ReadingDnaDimension =
  | 'reading-style'
  | 'visual-processing'
  | 'reading-strategy'
  | 'focus-pattern'
  | 'difficulty-comfort'
  | 'category-preference'

export type ReadingDnaTrait = {
  dimension: ReadingDnaDimension
  label: string
  confidence: number // 0-100
}

export type AchievementCategory = 'sessions' | 'accuracy' | 'speed' | 'streak'

// Which PersonalBests/profile metric this achievement's threshold applies
// to — data-driven rather than special-cased per achievement id.
export type AchievementMetric = 'sessionsCompleted' | 'bestAccuracy' | 'bestComprehension' | 'highestWpm' | 'longestStreak'

export type AchievementDefinition = {
  id: string
  category: AchievementCategory
  metric: AchievementMetric
  title: string
  description: string
  threshold: number
}

export type UnlockedAchievement = AchievementDefinition & {
  unlocked: boolean
  progressToward: number // 0-1, how close to unlocking (1 = unlocked)
}

export type PersonalBests = {
  highestWpm: number | null
  highestReadingScore: number | null
  bestAccuracy: number | null
  bestComprehension: number | null
  fastestSessionMs: number | null
  longestStreak: number
  bestReadingDay: { dateKey: string; sessionCount: number } | null
}

export type CategoryPerformance = {
  category: PassageCategory
  sessionCount: number
  averageAccuracy: number
  lastPracticedDateKey: string | null
}

export type CategoryIntelligence = {
  strongCategories: readonly PassageCategory[]
  weakCategories: readonly PassageCategory[]
  recentlyPracticed: readonly PassageCategory[]
  needsRevision: readonly PassageCategory[]
  suggestedNextCategory: PassageCategory | null
}
