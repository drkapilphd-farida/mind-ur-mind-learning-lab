import type { LearnerProfile, SkillGap } from '../types'

export interface SkillGapAnalyzer {
  analyze(profile: LearnerProfile): readonly SkillGap[]
}
