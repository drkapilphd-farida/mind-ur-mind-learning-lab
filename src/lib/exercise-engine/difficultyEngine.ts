// Difficulty Engine™ — manages the 5-level difficulty system.
//
// Difficulty affects content selection, scoring multipliers, and adaptive
// speed thresholds. Every exercise declares its own difficulty ladder in
// its AdaptiveRules; this engine provides the universal helpers.

import type { DifficultyTier, AdaptiveRules } from '@/types/exercise-engine'

export const DIFFICULTY_TIERS: readonly DifficultyTier[] = [
  'beginner', 'easy', 'medium', 'advanced', 'expert',
]

export function getDifficultyLabel(tier: DifficultyTier): string {
  const labels: Record<DifficultyTier, string> = {
    beginner: 'Beginner',
    easy: 'Easy',
    medium: 'Developing',
    advanced: 'Advanced',
    expert: 'Expert',
    adaptive: 'Adaptive',
  }
  return labels[tier]
}

export function getDifficultyDescription(tier: DifficultyTier): string {
  const descriptions: Record<DifficultyTier, string> = {
    beginner: 'Building the foundation',
    easy: 'Getting comfortable',
    medium: 'Steady progress',
    advanced: 'Pushing your limits',
    expert: 'Elite performance',
    adaptive: 'The engine decides — just show up',
  }
  return descriptions[tier]
}

// Advance to next difficulty tier
export function increaseDifficulty(current: DifficultyTier): DifficultyTier {
  if (current === 'adaptive') return 'adaptive'
  const idx = DIFFICULTY_TIERS.indexOf(current)
  return DIFFICULTY_TIERS[Math.min(idx + 1, DIFFICULTY_TIERS.length - 1)] ?? current
}

// Return to previous difficulty tier
export function decreaseDifficulty(current: DifficultyTier): DifficultyTier {
  if (current === 'adaptive') return 'adaptive'
  const idx = DIFFICULTY_TIERS.indexOf(current)
  return DIFFICULTY_TIERS[Math.max(idx - 1, 0)] ?? current
}

// Determine whether accuracy warrants a difficulty increase or decrease
export function computeDifficultyAdjustment(
  currentTier: DifficultyTier,
  accuracyPercent: number,
  rules: AdaptiveRules,
): DifficultyTier {
  if (currentTier === 'adaptive') return 'adaptive'
  if (accuracyPercent > rules.increaseSpeedAbove) return increaseDifficulty(currentTier)
  if (accuracyPercent < rules.decreaseSpeedBelow) return decreaseDifficulty(currentTier)
  return currentTier
}

// Ordinal position for comparison (beginner=0, expert=4)
export function difficultyRank(tier: DifficultyTier): number {
  if (tier === 'adaptive') return 2  // treat as medium for ranking purposes
  return DIFFICULTY_TIERS.indexOf(tier)
}
