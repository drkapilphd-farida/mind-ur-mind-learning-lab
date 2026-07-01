// Difficulty Engine™ — extended in Sprint 5D with elite and master tiers.
// Pure functions only. Sprint 6 AI Mentor™ will replace the recommendation
// layer without touching these helpers.

import type { DifficultyTier, AdaptiveRules } from '@/types/exercise-engine'

// Ordered from easiest to hardest — adaptive is handled separately.
export const DIFFICULTY_TIERS: readonly DifficultyTier[] = [
  'beginner', 'easy', 'medium', 'advanced', 'expert', 'elite', 'master',
]

export function getDifficultyLabel(tier: DifficultyTier): string {
  const labels: Record<DifficultyTier, string> = {
    beginner: 'Beginner',
    easy: 'Easy',
    medium: 'Developing',
    advanced: 'Advanced',
    expert: 'Expert',
    elite: 'Elite',
    master: 'Master',
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
    expert: 'Elite-level performance',
    elite: 'Exceptional cognitive speed',
    master: 'Maximum challenge — peak human performance',
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

// Ordinal position for comparison (beginner=0, master=6, adaptive=3)
export function difficultyRank(tier: DifficultyTier): number {
  if (tier === 'adaptive') return 3  // treat as between medium and advanced
  return DIFFICULTY_TIERS.indexOf(tier)
}
