// Daily Training Plan — Sprint 5, Part 6. Built entirely from real,
// existing Quantum Speed Reading passages (never a cross-reference to the
// separate, ungated Reading Expansion Pack system) with an honest total
// time from each passage's own real word count and pace.

import { getPassagesByCategory, PASSAGE_LIBRARY, type Passage, type PassageCategory } from '../passageLibrary'
import { estimateReadingTimeSec, formatReadingTime } from '../passageDifficulty'
import type { CategoryIntelligence, ReadingProfile } from '../adaptive-intelligence/readingIntelligenceTypes'
import { recommendNextSession } from './nextSessionRecommendationEngine'
import type { ReadingSessionRecord, ReadingGoalId } from '../adaptive-intelligence/readingIntelligenceTypes'

export type DailyPlanStep = { label: string; passage: Passage }
export type DailyPlan = { steps: readonly DailyPlanStep[]; estimatedTimeSec: number; estimatedTimeLabel: string }

const FALLBACK_CATEGORY: PassageCategory = 'science'

function firstEasyPassage(category: PassageCategory): Passage {
  return getPassagesByCategory(category).find((p) => p.difficulty === 'easy') ?? PASSAGE_LIBRARY[0]!
}

export function generateDailyPlan(
  profile: ReadingProfile,
  categoryIntelligence: CategoryIntelligence,
  latest: ReadingSessionRecord | null,
  previous: ReadingSessionRecord | null,
  goalId: ReadingGoalId | null,
): DailyPlan {
  const usedCategories = new Set<PassageCategory>()

  // Warm-up — an easy passage in a category that needs revision (or the
  // learner's weakest), never the same category twice in this plan.
  const warmupCategory = categoryIntelligence.needsRevision[0] ?? profile.weakestCategory ?? FALLBACK_CATEGORY
  const warmupPassage = firstEasyPassage(warmupCategory)
  usedCategories.add(warmupPassage.category)

  // Main practice — the same recommendation the Coach panel gives.
  const recommendation = recommendNextSession(profile, categoryIntelligence, latest, previous, goalId)
  const mainPassage = recommendation && !usedCategories.has(recommendation.passage.category)
    ? recommendation.passage
    : getPassagesByCategory(FALLBACK_CATEGORY).find((p) => !usedCategories.has(p.category)) ?? PASSAGE_LIBRARY[1]!
  usedCategories.add(mainPassage.category)

  // Review — revisit the most recently practiced category at the same
  // difficulty, or another fresh category if there's no history yet.
  const reviewCategory = latest && !usedCategories.has(latest.category) ? latest.category : PASSAGE_LIBRARY.find((p) => !usedCategories.has(p.category))?.category ?? FALLBACK_CATEGORY
  const reviewDifficulty = latest?.difficulty ?? 'easy'
  const reviewPassage = getPassagesByCategory(reviewCategory).find((p) => p.difficulty === reviewDifficulty) ?? firstEasyPassage(reviewCategory)

  const steps: DailyPlanStep[] = [
    { label: 'Warm-up', passage: warmupPassage },
    { label: 'Main Practice', passage: mainPassage },
    { label: 'Review Session', passage: reviewPassage },
  ]

  const estimatedTimeSec = steps.reduce((sum, step) => sum + estimateReadingTimeSec(step.passage.wordCount, step.passage.difficulty), 0)

  return { steps, estimatedTimeSec, estimatedTimeLabel: formatReadingTime(estimatedTimeSec) }
}
