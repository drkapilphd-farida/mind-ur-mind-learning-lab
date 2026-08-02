// The Difficulty Recommendation Engine's™ output vocabulary — same
// 4 tiers as SkillLevel, kept as its own type since the two represent
// different concepts (a learner's current skill vs. the difficulty
// this plan recommends they train at).
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'
