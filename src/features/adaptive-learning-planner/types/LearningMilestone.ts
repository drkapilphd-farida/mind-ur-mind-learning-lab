// The Learning Milestone Generator's™ output — always forward-looking
// (only milestones ahead of the learner's current journeyProgressPercent),
// never a claim about progress not actually reached ("No fake progress").
export type LearningMilestone = {
  id: string
  description: string
  targetProgressPercent: number
}
