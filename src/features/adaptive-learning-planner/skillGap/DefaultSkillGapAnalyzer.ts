import type { LearnerProfile, SkillGap } from '../types'
import type { SkillGapAnalyzer } from '../contracts'
import { skillLevelToScore } from '../skillLevelScore'

// Implements SkillGapAnalyzer. `gapScore` is derived purely from each
// skill's own currentLevel (100 minus its tier score) — never an
// invented number, never reads mindScore/assessmentResults directly
// (those inform DifficultyRecommendationEngine instead, so each engine
// has exactly one clear responsibility).
export class DefaultSkillGapAnalyzer implements SkillGapAnalyzer {
  analyze(profile: LearnerProfile): readonly SkillGap[] {
    return [
      { skill: 'reading', currentLevel: profile.readingLevel, gapScore: 100 - skillLevelToScore(profile.readingLevel) },
      { skill: 'memory', currentLevel: profile.memoryLevel, gapScore: 100 - skillLevelToScore(profile.memoryLevel) },
      { skill: 'focus', currentLevel: profile.focusLevel, gapScore: 100 - skillLevelToScore(profile.focusLevel) },
    ]
  }
}

export function createSkillGapAnalyzer(): SkillGapAnalyzer {
  return new DefaultSkillGapAnalyzer()
}
