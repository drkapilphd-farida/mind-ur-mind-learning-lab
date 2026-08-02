import type { AnalyzedGoal, LearningMilestone } from '../types'

// Always forward-looking from `currentProgressPercent` — never claims
// progress the learner hasn't actually reached ("No fake progress").
export interface LearningMilestoneGenerator {
  generate(currentProgressPercent: number, goal: AnalyzedGoal): readonly LearningMilestone[]
}
