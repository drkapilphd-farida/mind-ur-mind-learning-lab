import type { AssessmentResult } from './AssessmentResult'
import type { SkillLevel } from './SkillLevel'

// The whole pipeline's single input — every field named in the Sprint
// 9 brief's own INPUT list. Never fetched by this feature itself ("no
// database dependency," same discipline as the AI Intelligence Layer,
// Sprint 7) — a caller who already has this data hands it in.
export type LearnerProfile = {
  mindScore: number
  journeyProgressPercent: number
  assessmentResults: readonly AssessmentResult[]
  readingLevel: SkillLevel
  memoryLevel: SkillLevel
  focusLevel: SkillLevel
  learningGoal: string
  availableMinutesPerDay: number
}
