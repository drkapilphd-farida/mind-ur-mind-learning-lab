import type { SkillLevel } from './types'

// Shared by SkillGapAnalyzer and DifficultyRecommendationEngine — "no
// duplicated logic" for the one mapping both need: a SkillLevel's
// position among the 4 tiers, as a 0-100 number.
const SKILL_LEVEL_SCORE: Record<SkillLevel, number> = {
  beginner: 0,
  intermediate: 33,
  advanced: 66,
  expert: 100,
}

export function skillLevelToScore(level: SkillLevel): number {
  return SKILL_LEVEL_SCORE[level]
}

const SKILL_LEVEL_ORDER: readonly SkillLevel[] = ['beginner', 'intermediate', 'advanced', 'expert']

export function skillLevelIndex(level: SkillLevel): number {
  return SKILL_LEVEL_ORDER.indexOf(level)
}

export function skillLevelAtIndex(index: number): SkillLevel {
  const clampedIndex = Math.min(SKILL_LEVEL_ORDER.length - 1, Math.max(0, index))
  const level = SKILL_LEVEL_ORDER[clampedIndex]
  if (!level) throw new Error(`Invalid skill level index: ${index}`)
  return level
}
