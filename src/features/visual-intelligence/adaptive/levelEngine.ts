// Visual Intelligence Lab™ — Adaptive Visual Intelligence™, Sprint 7.
// Level Engine — Current XP and level progress for the Visual Progress
// Ring. "Current Progress"/"Next Level Progress" are tied directly to the
// SAME thresholds driving the displayed difficulty level (not a separate
// invented XP ladder, which could disagree with the shown level).

import { computeDifficultyLevel, DIFFICULTY_LEVEL_NAME, DIFFICULTY_LEVEL_THRESHOLDS } from './difficultyCalculator'
import type { DifficultyLevelNumber, LevelProgress, UnifiedVisualStats } from './types/adaptiveTypes'

export function computeXpTotal(stats: UnifiedVisualStats): number {
  return stats.totalXp
}

export function computeLevelProgress(stats: UnifiedVisualStats): LevelProgress {
  const currentLevel = computeDifficultyLevel(stats)
  const currentLevelName = DIFFICULTY_LEVEL_NAME[currentLevel]

  if (currentLevel === 5) {
    return { currentLevel, currentLevelName, currentXp: stats.totalXp, progress: 1, nextLevel: null, nextLevelName: null }
  }

  const nextLevel = (currentLevel + 1) as DifficultyLevelNumber
  const nextLevelName = DIFFICULTY_LEVEL_NAME[nextLevel]
  const threshold = DIFFICULTY_LEVEL_THRESHOLDS.find((t) => t.level === nextLevel)

  if (!threshold) {
    return { currentLevel, currentLevelName, currentXp: stats.totalXp, progress: 0, nextLevel, nextLevelName }
  }

  const sessionProgress = threshold.sessionThreshold === 0 ? 1 : Math.min(1, stats.completedSessionCount / threshold.sessionThreshold)
  const streakProgress = threshold.streakThreshold === 0 ? 1 : Math.min(1, stats.currentStreak / threshold.streakThreshold)
  const progress = (sessionProgress + streakProgress) / 2

  return { currentLevel, currentLevelName, currentXp: stats.totalXp, progress, nextLevel, nextLevelName }
}
