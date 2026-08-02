// Visual Intelligence Lab™ — Adaptive Visual Intelligence™, Sprint 7.
// Adaptive Engine — the top-level orchestrator composing all 5 independent
// services (Difficulty Calculator, Recommendation Engine, Performance
// Engine, Achievement Engine, Level Engine) into one result. Pure — takes
// an already-fetched UnifiedVisualStats snapshot, no DB access itself.

import { applyDifficultyRules, DIFFICULTY_LEVEL_NAME } from './difficultyCalculator'
import { recommendGoal, recommendTiming, selectChallenge } from './recommendationEngine'
import { computePerformanceMetrics } from './performanceEngine'
import { computeAchievements } from './achievementEngine'
import { computeLevelProgress } from './levelEngine'
import type { AdaptiveEngineResult, UnifiedVisualStats } from './types/adaptiveTypes'

// Estimated Training Time on the Recommendation Card is the honest sum of
// the recommended session's own duration plus the fixed observation-stage
// overhead this lab's guided flows already use (countdown, reflection,
// coach message) — approximated here as the recommended duration itself
// plus a fixed 60s for the surrounding guided steps, never a fabricated
// "total workout time" estimate disconnected from the actual number shown.
const ESTIMATED_OVERHEAD_SECONDS = 60

export function runAdaptiveEngine(stats: UnifiedVisualStats): AdaptiveEngineResult {
  const difficultyLevel = applyDifficultyRules(stats)
  const difficultyLevelName = DIFFICULTY_LEVEL_NAME[difficultyLevel]

  const suggestedDurationSeconds = recommendTiming(stats)
  const recommendation = {
    recommendedChallenge: selectChallenge(stats),
    suggestedDurationSeconds,
    suggestedDifficulty: difficultyLevel,
    suggestedGoal: recommendGoal(stats),
    estimatedTrainingTimeSeconds: suggestedDurationSeconds + ESTIMATED_OVERHEAD_SECONDS,
  }

  const performance = computePerformanceMetrics(stats)
  const achievements = computeAchievements(stats)
  const levelProgress = computeLevelProgress(stats)

  return {
    stats,
    difficultyLevel,
    difficultyLevelName,
    recommendation,
    performance,
    achievements,
    levelProgress,
  }
}
