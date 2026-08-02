import type { SkillArea } from './SkillArea'

// The Learning Goal Analyzer's™ output — a raw goal string classified
// into the one SkillArea it most directly targets, via deterministic
// keyword matching (never an LLM call — "pure deterministic planners").
export type AnalyzedGoal = {
  rawGoal: string
  focusSkill: SkillArea
}
