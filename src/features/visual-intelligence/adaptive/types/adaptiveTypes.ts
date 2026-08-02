// Visual Intelligence Lab™ — Adaptive Visual Intelligence™, Sprint 7.
// Shared types for the deterministic adaptive engine — every field here is
// either a real stored value or a pure function of real stored values.
// No machine learning, no fabricated measurements.

export type DifficultyLevelNumber = 1 | 2 | 3 | 4 | 5
export type DifficultyLevelName = 'Beginner' | 'Explorer' | 'Focused' | 'Advanced' | 'Master'

export type UnifiedVisualStats = {
  completedSessionCount: number
  imagePersistenceCompletedCount: number
  fixationCompletedCount: number
  persistenceChallengeCompletedCount: number
  visualPreparationCompletedCount: number
  currentStreak: number
  bestStreak: number
  totalDurationSeconds: number
  avgSessionTimeSeconds: number
  /** Average accuracy_percent over fixation multi-dot/peripheral rows only.
   * null when no such rows exist — never fabricated as 0 or 100. */
  successRate: number | null
  /** Fraction of persistence-challenge sessions with a non-empty journal
   * entry. Doubles as the honest measurement for "Reflection Completion"
   * (reflection itself is always answered, so that alone is uninformative).
   * null when zero persistence-challenge sessions exist. */
  observationJournalUsageRate: number | null
  /** Not instrumented anywhere in Sprints 1-6 — always 0, never estimated. */
  restartCount: number
  /** Not instrumented anywhere in Sprints 1-6 — always 0, never estimated. */
  skippedSessions: number
  totalXp: number
}

export type AdaptiveTimingSeconds = 30 | 45 | 60 | 75 | 90

export type ChallengeSelection = 'repeat-previous' | 'move-to-next' | 'suggest-easier' | 'suggest-harder'

export type AdaptiveGoal = 'Improve Focus' | 'Increase Duration' | 'Increase Observation Quality'

export type PerformanceMetrics = {
  visualStability: number
  observationConsistency: number
  focusGrowth: number
  trainingFrequency: number
  persistenceLevel: number
  visualReadiness: number
}

export type UnlockedAchievement = {
  id: string
  title: string
  description: string
  unlocked: boolean
  /** 0-1, meaningful mainly while locked. */
  progressToward: number
}

export type RecommendationCardData = {
  recommendedChallenge: ChallengeSelection
  suggestedDurationSeconds: AdaptiveTimingSeconds
  suggestedDifficulty: DifficultyLevelNumber
  suggestedGoal: AdaptiveGoal
  estimatedTrainingTimeSeconds: number
}

export type LevelProgress = {
  currentLevel: DifficultyLevelNumber
  currentLevelName: DifficultyLevelName
  currentXp: number
  /** 0-1 toward nextLevel; 1 when already at Level 5 (Master). */
  progress: number
  nextLevel: DifficultyLevelNumber | null
  nextLevelName: DifficultyLevelName | null
}

export type AdaptiveEngineResult = {
  stats: UnifiedVisualStats
  difficultyLevel: DifficultyLevelNumber
  difficultyLevelName: DifficultyLevelName
  recommendation: RecommendationCardData
  performance: PerformanceMetrics
  achievements: readonly UnlockedAchievement[]
  levelProgress: LevelProgress
}
