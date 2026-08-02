// Photographic Memory™ — Multi-Category Content Engine. Orchestrates 4
// independent, self-contained category modules (mandala/icon-cluster/
// flash-matrix/color-shape — see ./categories/), each owning its own
// content pool and "tricky near-clone distractor" generation. A session
// is ROUNDS_PER_SESSION (10) rounds; by default (category filter 'all')
// every round's category is drawn from a shuffled cycle of all 4 so a
// session "dynamically cycles through" every category, but a learner can
// also lock a session to one specific category via
// PhotographicMemoryCategoryFilter — both explicit requirements this
// engine satisfies at once, not either/or.
import { shuffle } from './shuffle'
import { buildMandalaRound, type MandalaOptionContent } from './categories/mandalaCategory'
import { buildIconClusterRound, type IconClusterOptionContent } from './categories/iconClusterCategory'
import { buildFlashMatrixRound, type TextOptionContent } from './categories/flashMatrixCategory'
import { buildColorShapeRound, type ColorShapeOptionContent } from './categories/colorShapeCategory'

export type PhotographicMemoryCategory = 'mandala' | 'icon-cluster' | 'flash-matrix' | 'color-shape'
export type PhotographicMemoryCategoryFilter = 'all' | PhotographicMemoryCategory

export const CATEGORY_LABELS: Record<PhotographicMemoryCategory, string> = {
  mandala: 'Mandalas',
  'icon-cluster': 'Abstract Icons',
  'flash-matrix': 'Word & Number',
  'color-shape': 'Color-Shape',
}

const ALL_CATEGORIES: readonly PhotographicMemoryCategory[] = ['mandala', 'icon-cluster', 'flash-matrix', 'color-shape']

export type PhotographicMemoryOptionContent = MandalaOptionContent | IconClusterOptionContent | TextOptionContent | ColorShapeOptionContent

export type PhotographicMemoryRound = {
  category: PhotographicMemoryCategory
  target: PhotographicMemoryOptionContent
  correctOptionId: string
  options: readonly PhotographicMemoryOptionContent[]
}

export const ROUNDS_PER_SESSION = 10

// Fills all ROUNDS_PER_SESSION slots by cycling repeatedly through the 4
// categories (so every category appears at least twice in a 10-round
// "all" session, never left out to chance) then shuffles the order. A
// locked single-category filter simply repeats that one category.
function buildRoundCategorySequence(filter: PhotographicMemoryCategoryFilter): readonly PhotographicMemoryCategory[] {
  if (filter !== 'all') {
    return Array.from({ length: ROUNDS_PER_SESSION }, () => filter)
  }
  const cycled: PhotographicMemoryCategory[] = []
  for (let i = 0; i < ROUNDS_PER_SESSION; i += 1) {
    const category = ALL_CATEGORIES[i % ALL_CATEGORIES.length]
    if (category !== undefined) cycled.push(category)
  }
  return shuffle(cycled)
}

function buildRoundForCategory(category: PhotographicMemoryCategory, excludeIds: ReadonlySet<string>): PhotographicMemoryRound {
  switch (category) {
    case 'mandala': {
      const result = buildMandalaRound(excludeIds)
      return { category, ...result }
    }
    case 'icon-cluster': {
      const result = buildIconClusterRound(excludeIds)
      return { category, ...result }
    }
    case 'flash-matrix': {
      const result = buildFlashMatrixRound(excludeIds)
      return { category, ...result }
    }
    case 'color-shape': {
      const result = buildColorShapeRound(excludeIds)
      return { category, ...result }
    }
  }
}

// Pre-builds the entire session's rounds upfront (like every other
// gamified exercise's shuffled deck/sequence in this project) rather than
// generating each round lazily mid-session — simpler state management,
// and lets us track "already used this session" per category cleanly.
export function buildSessionRounds(filter: PhotographicMemoryCategoryFilter): readonly PhotographicMemoryRound[] {
  const categorySequence = buildRoundCategorySequence(filter)
  const usedIdsByCategory: Record<PhotographicMemoryCategory, Set<string>> = {
    mandala: new Set(),
    'icon-cluster': new Set(),
    'flash-matrix': new Set(),
    'color-shape': new Set(),
  }

  return categorySequence.map((category) => {
    const round = buildRoundForCategory(category, usedIdsByCategory[category])
    usedIdsByCategory[category].add(round.correctOptionId)
    return round
  })
}

// Streak & scoring — every 2 consecutive correct recalls bumps the
// multiplier by +1 (streak 0-1 -> x1, 2-3 -> x2, 4-5 -> x3, ...), applied
// to a flat base-points value per correct recall. Deliberately its own
// independent copy of this formula (not imported from any sibling
// exercise's dataset file) — every top-level exercise in this project
// owns its own scoring logic self-contained.
export const BASE_POINTS_PER_CORRECT_GUESS = 150
const STREAK_MULTIPLIER_STEP = 2

export function computeStreakMultiplier(streak: number): number {
  return 1 + Math.floor(streak / STREAK_MULTIPLIER_STEP)
}

export function computePointsForCorrectGuess(streakAfterThisGuess: number): number {
  return BASE_POINTS_PER_CORRECT_GUESS * computeStreakMultiplier(streakAfterThisGuess)
}

// A one-time bonus for a flawless dash (every round correct), added to
// the session's total once at completion.
export const PERFECT_SESSION_BONUS = 500
