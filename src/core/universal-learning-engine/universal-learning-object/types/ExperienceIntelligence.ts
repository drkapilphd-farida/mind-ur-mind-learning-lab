// Universal Learning Object™ (UCE-6) — real re-shapes of UCE-5's
// `LearningAnalysis`, never new intelligence.
export type LearningJourneyStep = {
  order: number
  conceptNodeId: string
  label: string
  // Real: sum of `estimatedLearningTimeSeconds` across every chunk that
  // introduces this milestone's concept (see internal/
  // buildLearningJourney.ts).
  estimatedTimeSeconds: number
}

// Real: `analysis.learningMilestones` re-shaped into an ordered sequence
// with a real per-step time estimate — the document-level "Learning
// Journey" a Learning Mode can render as a real progress path.
export type LearningJourney = {
  steps: readonly LearningJourneyStep[]
  totalEstimatedTimeSeconds: number
}

// Real threshold classification over `expectedCognitiveLoad` — see
// internal/buildAttentionBlueprint.ts. This single type satisfies both
// the brief's "Attention Blueprint" and "Focus Blueprint" line items:
// they name the same real signal (how much sustained focus a chunk
// demands) under two labels. Implemented once, documented as covering
// both — never duplicated as two identical models.
export type FocusLevel = 'low' | 'moderate' | 'high'

export type AttentionBlueprintEntry = {
  chunkNodeId: string
  focusLevel: FocusLevel
}

export type AttentionBlueprint = {
  entries: readonly AttentionBlueprintEntry[]
}

// Smart Notes™ Sprint-1 amendment: 'smart-notes' added as a genuine sixth
// value — Smart Notes is its own real production module (LSE-1's own
// `LearningModeType` already reserved a 'smart-notes' slot) and must not
// be mislabeled as 'research' or 'revision'. `learning_sessions`'s own
// CHECK constraint was widened to match
// (20260718000001_widen_learning_sessions_smart_notes.sql).
//
// AI Learning Studio™ Sprint ALS-16 amendment: 'focus' added — Focus
// Mode™ is its own real production module (Deep Focus Timer, Reading
// Sprint, Pomodoro Mode), a genuine chunk-stepping session like Reading/
// Memory, not a re-labeling of either. `learning_sessions`'s own CHECK
// constraint was widened to match
// (20260722000001_widen_learning_sessions_focus.sql).
//
// AI Learning Studio™ Sprint ALS-17 amendment: 'mcqs' added — MCQs™ is
// its own real production module (real structural questions about the
// document's own organization, never fabricated comprehension
// questions — see src/features/mcqs-mode-runtime/presentation/
// buildStructureQuestion.ts). `learning_sessions`'s own CHECK constraint
// was widened to match (20260723000001_widen_learning_sessions_mcqs.sql).
// Note `'revision'` needed no equivalent amendment — it was already a
// real value in this union and in the table's own original CHECK
// constraint from Sprint 1, simply never implemented until Revision
// Mode™, this same sprint.
export type SessionType = 'reading' | 'memory' | 'revision' | 'research' | 'practice' | 'smart-notes' | 'focus' | 'mcqs'

// Real, document-level (never per-learner) session sizing guidance —
// see internal/buildSessionRecommendations.ts. Only a `'reading'` entry
// is ever produced this sprint: it's the only session type with a real
// per-document time basis (`estimatedTotalLearningTimeSeconds`).
// Memory/revision/research/practice session recommendations are
// disclosed as absent, not fabricated — no real per-session time
// signal exists for them yet.
export type SessionRecommendation = {
  sessionType: SessionType
  recommendedCount: number
  averageDurationSeconds: number
}

// "Progress Blueprint" and "Motivation Hooks" (the brief's other
// Experience Intelligence line items) are deliberately NOT implemented
// here — see types/TransformationModel.ts. Both require real per-learner
// progress state, which doesn't exist yet (no Learning Session Engine,
// no per-user tracking sprint); embedding them on this shared,
// immutable object would break immutability the moment any learner made
// progress. Reserved there instead, merged with the brief's separate
// "TRANSFORMATION MODEL" section since they're the same underlying
// concern.
export type ExperienceIntelligence = {
  learningJourney: LearningJourney
  attentionBlueprint: AttentionBlueprint
  sessionRecommendations: readonly SessionRecommendation[]
}
