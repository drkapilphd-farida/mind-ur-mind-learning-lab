import type { SkillArea } from './SkillArea'

// The Exercise Selection Engine's™ output. `exerciseId` is illustrative
// catalog data owned by this feature (see exerciseSelection/EXERCISE_CATALOG.ts)
// — not a live lookup into any other feature's real exercise routes,
// consistent with staying fully self-contained.
export type ExerciseRecommendation = {
  skill: SkillArea
  exerciseId: string
  priority: number
}
