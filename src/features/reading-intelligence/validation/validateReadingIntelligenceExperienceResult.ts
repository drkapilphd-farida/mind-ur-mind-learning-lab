import type {
  ReadingIntelligenceExperienceResult,
  ReadingIntelligenceValidation,
  ReadingIntelligenceValidationIssue,
} from '../types'

// Pure — checks internal consistency of the *composed* result only. Does not
// re-validate the real data this feature was built from (getModuleProgress,
// getExerciseAccess, etc. already guarantee their own correctness).
export function validateReadingIntelligenceExperienceResult(
  result: ReadingIntelligenceExperienceResult,
): ReadingIntelligenceValidation {
  const issues: ReadingIntelligenceValidationIssue[] = []

  const { xp, progressSnapshot, journeyState } = result

  if (xp.totalXp < 0 || xp.fromCompletedExercises < 0 || xp.fromStreak < 0) {
    issues.push({ type: 'non-negative-xp', detail: 'XP fields must never be negative.' })
  }

  if (progressSnapshot.overallCompletedCount > progressSnapshot.overallTotalCount) {
    issues.push({
      type: 'progress-count-overflow',
      detail: `overallCompletedCount (${progressSnapshot.overallCompletedCount}) exceeds overallTotalCount (${progressSnapshot.overallTotalCount}).`,
    })
  }

  if (journeyState.mindScore < 0 || journeyState.mindScore > 1000) {
    issues.push({
      type: 'mind-score-out-of-range',
      detail: `mindScore (${journeyState.mindScore}) is outside the valid 0-1000 range.`,
    })
  }

  return { valid: issues.length === 0, issues }
}
