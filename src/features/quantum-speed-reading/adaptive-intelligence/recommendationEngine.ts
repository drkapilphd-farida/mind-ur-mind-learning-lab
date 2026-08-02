// Adaptive Recommendation Engine — Sprint 4. Generates the short coaching
// lines shown in the AI Coach panel, from real session data + the Smart
// Difficulty Engine's suggestion. Never a fixed template with fabricated
// numbers — every number quoted comes directly from the session record.

import { estimateWpm, PASSAGE_CATEGORY_LABEL } from '../passageDifficulty'
import { computeSpeedScore } from '../comprehensionEngine'
import type { ReadingGoalId } from './readingIntelligenceTypes'
import type { ReadingSessionRecord, CategoryIntelligence } from './readingIntelligenceTypes'
import { getReadingGoal } from './goalCatalog'

// "Today's Insight" — the headline WPM/accuracy delta versus the previous
// session, or a first-session welcome when there's no prior session yet.
export function generateTodaysInsight(latest: ReadingSessionRecord, previous: ReadingSessionRecord | null): string {
  if (!previous) {
    return `You completed your first tracked session at ${latest.wpm} WPM with ${latest.accuracyPercent}% accuracy. Every session from here sharpens your Reading DNA™.`
  }

  const wpmDelta = latest.wpm - previous.wpm
  if (wpmDelta > 0 && latest.accuracyPercent >= previous.accuracyPercent) {
    return `Reading speed improved by ${wpmDelta} WPM while maintaining accuracy. Excellent balance.`
  }
  if (wpmDelta > 0) {
    return `Reading speed improved by ${wpmDelta} WPM, though accuracy shifted from ${previous.accuracyPercent}% to ${latest.accuracyPercent}%.`
  }
  if (wpmDelta < 0) {
    return `Reading speed eased by ${Math.abs(wpmDelta)} WPM this session — comprehension held at ${latest.comprehensionPercent}%.`
  }
  return `Your pace held steady at ${latest.wpm} WPM with ${latest.accuracyPercent}% accuracy.`
}

// A speed/comprehension caution, separate from the Smart Difficulty
// Engine's advance/repeat/balance verdict — triggers when WPM is running
// well ahead of the passage's own target pace while comprehension lags.
export function generateSpeedCaution(session: ReadingSessionRecord): string | null {
  const targetWpm = estimateWpm(session.difficulty)
  const speedScore = computeSpeedScore(session.wpm, targetWpm)
  if (speedScore >= 100 && session.comprehensionPercent < 85) {
    return `You are reading quickly relative to this passage's pace. Reduce speed slightly — aim for 95% comprehension.`
  }
  return null
}

// "Coach Recommendation" — category-rotation-aware practice suggestion.
export function generateCategoryRotationMessage(intelligence: CategoryIntelligence): string | null {
  if (intelligence.strongCategories.length > 0 && intelligence.weakCategories.length > 0) {
    const strong = PASSAGE_CATEGORY_LABEL[intelligence.strongCategories[0]!]
    const weak = PASSAGE_CATEGORY_LABEL[intelligence.weakCategories[0]!]
    return `${strong} is becoming easy. Let's strengthen ${weak}.`
  }
  if (intelligence.suggestedNextCategory) {
    return `Try a passage in ${PASSAGE_CATEGORY_LABEL[intelligence.suggestedNextCategory]} next to keep your practice well-rounded.`
  }
  return null
}

// "Today's Focus" — a concrete, honest comprehension target for the next
// session, anchored to the learner's own recent performance.
export function generateTodaysFocus(latest: ReadingSessionRecord): string {
  const target = Math.max(latest.comprehensionPercent, 90)
  return `Maintain comprehension above ${target}%.`
}

// Goal-aware coaching line — only shown when a goal is selected.
const GOAL_RECOMMENDATION: Record<ReadingGoalId, string> = {
  'academic-excellence': 'Focus on vocabulary and inference questions this week.',
  'faster-reading': 'Practice one Intermediate passage today to push your pace.',
  'better-comprehension': 'Slow down slightly on your next passage and review every explanation.',
  'professional-reading': 'Practice a Business or Technology passage today.',
  'book-reading-mastery': 'Practice longer passages tomorrow.',
  'competitive-exam-prep': 'Practice under a steady, exam-like pace today.',
}

export function generateGoalRecommendation(goalId: ReadingGoalId | null): string | null {
  if (!goalId) return null
  const goal = getReadingGoal(goalId)
  if (!goal) return null
  return `Goal: ${goal.title}. Recommendation: ${GOAL_RECOMMENDATION[goalId]}`
}
