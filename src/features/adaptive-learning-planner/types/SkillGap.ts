import type { SkillArea } from './SkillArea'
import type { SkillLevel } from './SkillLevel'

// The Skill Gap Analyzer's™ output — one entry per skill area.
// `gapScore` (0-100) is derived purely from `currentLevel` (100 minus
// the level's own numeric position among the 4 tiers) — never an
// invented number.
export type SkillGap = {
  skill: SkillArea
  currentLevel: SkillLevel
  gapScore: number
}
