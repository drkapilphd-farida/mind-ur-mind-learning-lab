import type { LearningObjectType } from './learningObject'

// Pipeline's final stage output. `reason` is always a plain-language,
// structural explanation (e.g. "flashcards build on key concepts") —
// never a claim about a specific learner's real performance, since no
// real learning-session history exists yet (same honesty constraint
// already applied throughout Sprint 2's AI Insights Panel).
export type AdaptiveRecommendation = {
  objectType: LearningObjectType
  reason: string
}
