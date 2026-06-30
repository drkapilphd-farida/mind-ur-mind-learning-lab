// Recommendation Engine™ — rule-based, deterministic, AI-ready.
//
// All recommendations are computed from real session data. No AI APIs used.
// The function signature is designed so Sprint 4C (AI Mentor™) can replace
// the internals with an LLM call without changing any UI component — the
// UI always receives an ExerciseRecommendation object regardless of source.

import type {
  ExerciseRecommendation,
  ExerciseRecommendationAction,
  PerformanceMetrics,
  ExercisePersistedState,
  SpeedMs,
} from '@/types/exercise-engine'
import { getSpeedLabel } from './speedEngine'

export function computeRecommendation(input: {
  metrics: PerformanceMetrics
  state: ExercisePersistedState
  nextSpeedMs: SpeedMs
  nextExerciseId: string | null
  nextExerciseHref: string | null
  exerciseName: string
}): ExerciseRecommendation {
  const { metrics, state, nextSpeedMs, nextExerciseId, nextExerciseHref, exerciseName } = input
  const { accuracyPercent, speedMs } = metrics
  const speedImproved = nextSpeedMs < speedMs

  let action: ExerciseRecommendationAction
  let message: string
  let detail: string | null = null

  if (metrics.accuracyPercent >= 90 && speedImproved) {
    action = 'increase-speed'
    message = `Accuracy was excellent. Flash duration drops to ${nextSpeedMs}ms.`
    detail = `You're at the ${getSpeedLabel(nextSpeedMs)} level. Keep this consistency.`
  } else if (accuracyPercent < 60) {
    action = 'decrease-speed'
    message = `Taking more time builds stronger recognition. Duration extended to ${nextSpeedMs}ms.`
    detail = 'Accuracy matters more than speed at this stage.'
  } else if (accuracyPercent < 70) {
    action = 'practice-again'
    message = `Another session at ${speedMs}ms will solidify the pattern.`
    detail = 'Consistent 70%+ is the threshold for advancing.'
  } else if (state.sessionCount > 0 && state.sessionCount % 5 === 0) {
    action = 'try-different-exercise'
    message = `You have completed ${state.sessionCount} ${exerciseName} sessions.`
    detail = nextExerciseId !== null
      ? 'Try a different exercise to cross-train your visual intelligence.'
      : 'Great consistency — keep it going.'
  } else {
    action = 'maintain-speed'
    message = 'Good session. Consistent practice compounds into real ability.'
    detail = `${accuracyPercent}% accuracy at ${speedMs}ms.`
  }

  return {
    action,
    message,
    detail,
    nextSpeedMs: action === 'maintain-speed' ? null : nextSpeedMs,
    nextExerciseId,
    nextExerciseHref,
  }
}

// Determine whether a student should rest based on session history
export function shouldRecommendRest(state: ExercisePersistedState): boolean {
  const recentCurve = state.progressCurve.slice(-3)
  if (recentCurve.length < 3) return false
  // Three consecutive sessions below 50% suggests fatigue, not skill gap
  return recentCurve.every((acc) => acc < 50)
}
