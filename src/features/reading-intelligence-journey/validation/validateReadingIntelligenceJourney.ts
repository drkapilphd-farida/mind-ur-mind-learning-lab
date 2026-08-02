import type {
  ReadingIntelligenceJourney,
  ReadingIntelligenceJourneyValidation,
  ReadingIntelligenceJourneyValidationIssue,
} from '../types'

// Pure — checks internal consistency of the *composed* journey only. Does
// not re-validate reading-intelligence's own data (already guaranteed
// correct by its own validator) — this is an independent, defensive check
// on this feature's own composed object.
export function validateReadingIntelligenceJourney(
  journey: ReadingIntelligenceJourney,
): ReadingIntelligenceJourneyValidation {
  const issues: ReadingIntelligenceJourneyValidationIssue[] = []

  if (journey.queue.remainingCount > journey.queue.items.length) {
    issues.push({
      type: 'queue-remaining-count-overflow',
      detail: `remainingCount (${journey.queue.remainingCount}) exceeds the queue's item count (${journey.queue.items.length}).`,
    })
  }

  if (journey.mindScore < 0 || journey.mindScore > 1000) {
    issues.push({
      type: 'mind-score-out-of-range',
      detail: `mindScore (${journey.mindScore}) is outside the valid 0-1000 range.`,
    })
  }

  if (journey.xp.totalXp < 0 || journey.xp.fromCompletedExercises < 0 || journey.xp.fromStreak < 0) {
    issues.push({ type: 'non-negative-xp', detail: 'XP fields must never be negative.' })
  }

  if (journey.progress.overallCompletedCount > journey.progress.overallTotalCount) {
    issues.push({
      type: 'progress-count-overflow',
      detail: `overallCompletedCount (${journey.progress.overallCompletedCount}) exceeds overallTotalCount (${journey.progress.overallTotalCount}).`,
    })
  }

  return { valid: issues.length === 0, issues }
}
