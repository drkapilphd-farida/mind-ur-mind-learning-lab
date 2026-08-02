import type {
  ReadingPlayerSessionSummary,
  ReadingPlayerValidation,
  ReadingPlayerValidationIssue,
} from '../types'

// Pure — checks internal consistency of the *composed* summary only. Does
// not re-validate reading-intelligence's own data (already guaranteed
// correct by its own validator) — this is a defensive, independent check on
// this feature's own composed object.
export function validateReadingPlayerSessionSummary(
  summary: ReadingPlayerSessionSummary,
): ReadingPlayerValidation {
  const issues: ReadingPlayerValidationIssue[] = []

  if (summary.readingScore !== null && (summary.readingScore < 0 || summary.readingScore > 100)) {
    issues.push({
      type: 'reading-score-out-of-range',
      detail: `readingScore (${summary.readingScore}) is outside the valid 0-100 range.`,
    })
  }

  if (summary.mindScore < 0 || summary.mindScore > 1000) {
    issues.push({
      type: 'mind-score-out-of-range',
      detail: `mindScore (${summary.mindScore}) is outside the valid 0-1000 range.`,
    })
  }

  if (summary.xp.totalXp < 0 || summary.xp.fromCompletedExercises < 0 || summary.xp.fromStreak < 0) {
    issues.push({ type: 'non-negative-xp', detail: 'XP fields must never be negative.' })
  }

  return { valid: issues.length === 0, issues }
}
