// Next Session Recommendation — Sprint 5, Part 5. Combines Sprint-4's
// Category Intelligence + Smart Difficulty Engine + selected goal, resolved
// to a real, existing passage — never a fabricated category/difficulty
// pairing with no content behind it.

import { getPassagesByCategory, type PassageCategory, type Passage } from '../passageLibrary'
import type { PassageDifficulty } from '../passageDifficulty'
import { suggestNextDifficulty } from '../adaptive-intelligence/difficultyEngine'
import { getReadingGoal } from '../adaptive-intelligence/goalCatalog'
import type { CategoryIntelligence, ReadingProfile, ReadingSessionRecord, ReadingGoalId } from '../adaptive-intelligence/readingIntelligenceTypes'

export type NextSessionRecommendation = {
  category: PassageCategory
  difficulty: PassageDifficulty
  passage: Passage
  reason: string
}

const FALLBACK_CATEGORY: PassageCategory = 'science'

export function recommendNextSession(
  profile: ReadingProfile,
  categoryIntelligence: CategoryIntelligence,
  latest: ReadingSessionRecord | null,
  previous: ReadingSessionRecord | null,
  goalId: ReadingGoalId | null,
): NextSessionRecommendation | null {
  const category = categoryIntelligence.suggestedNextCategory ?? profile.weakestCategory ?? profile.bestCategory ?? FALLBACK_CATEGORY

  const difficulty: PassageDifficulty = latest
    ? suggestNextDifficulty(latest, previous).suggestedDifficulty ?? 'easy'
    : 'easy'

  const candidates = getPassagesByCategory(category).filter((p) => p.difficulty === difficulty)
  const passage = candidates[0] ?? getPassagesByCategory(category)[0] ?? null
  if (!passage) return null

  const goal = goalId ? getReadingGoal(goalId) : null
  const reason = goal
    ? `Chosen to support your ${goal.title} goal and keep your practice well-rounded.`
    : categoryIntelligence.suggestedNextCategory === category
      ? 'A fresh category keeps your practice well-rounded.'
      : profile.weakestCategory === category
        ? 'Strengthening your weakest category builds a more balanced Reading DNA™.'
        : 'Building on your strongest category while you find your rhythm.'

  return { category, difficulty, passage, reason }
}
