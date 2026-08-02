import type { ConversationType } from './ConversationType'

// ConversationContext™ — everything one templated response needs,
// handed in by the caller (never fetched by this feature — "No
// database dependency" discipline, same as
// `@/features/ai-intelligence-layer`, Sprint 7). Deliberately a
// generic local shape rather than importing
// `@/features/adaptive-learning-planner`'s AdaptiveLearningPlan
// directly — this feature stays self-contained ("Provider Agnostic");
// a future bridge (same pattern as `@/features/ai-mentor-provider-bridge`,
// Sprint 5 Chunk 4) maps a real AdaptiveLearningPlan onto this shape
// without either feature importing the other. Every field is `| null`
// when unknown — never fabricated ("No hallucinated learner data").
export type ConversationContext = {
  learnerName: string
  conversationType: ConversationType
  focusSkill: string | null
  currentMilestone: string | null
  recommendedExercise: string | null
  progressPercent: number | null
  streak: number | null
}
