import type { LearningPlan } from '@/features/learning-intelligence/types'
import type { MentorActivitySnapshot } from '../types'

// The one place this feature imports from `learning-intelligence` —
// establishing a deliberate, one-way dependency (ai-mentor →
// learning-intelligence). learning-intelligence never imports back;
// verified with `madge --circular` in this chunk's own verification
// pass. `LearningPlan` has no `learningProjectId` field (its pipeline
// starts from a Document, not a LearningProject — see
// docs/adr/0001-ai-learning-studio-domain-model.md), so the caller
// supplies it separately. `sessionCount` defaults to 0 rather than
// fabricated — no real learning-session tracking exists yet (same
// honesty stance as MockGoalTrackingEngine, Chunk 2).
export type LearningSessionInput = {
  learningProjectId: string
  plan: LearningPlan
  sessionCount?: number
}

// "Learning Session → Learning Intelligence" pipeline stage: adapts
// learning-intelligence's rich LearningPlan into this feature's own,
// leaner MentorActivitySnapshot (Chunk 1, locked) — never an alias, a
// real translation at the boundary between two bounded contexts.
export interface LearningSessionAdapter {
  adapt(input: LearningSessionInput): MentorActivitySnapshot
}
