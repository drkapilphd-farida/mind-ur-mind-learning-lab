// Universal Learning Object™ (UCE-6) — RESERVED architecture for future
// progress tracking. Merges two of the brief's sections that describe
// the same underlying concern: Experience Intelligence's "Progress
// Blueprint" and the brief's separate "TRANSFORMATION MODEL" section
// (Before Learning / Current Progress / After Learning / Mastery /
// Completion / Learning Proof / Transformation Evidence) — one coherent
// reserved type family, not two overlapping ones.
//
// Deliberately NOT embedded on `UniversalLearningObject` or any of its
// intelligence layers: this is real per-learner state, while the ULO is
// document-level/shared and explicitly immutable. Attaches EXTERNALLY,
// keyed by `(learnerId, documentId)` — a future separate join/table,
// same architectural pattern as `PersonalizationContext`/
// `GraphAssessmentSignals`. No logic, no storage, no population here —
// the shape and this reasoning are the whole deliverable.
export type LearningTransformationState = 'before-learning' | 'in-progress' | 'after-learning'
export type MasteryLevel = 'none' | 'developing' | 'proficient' | 'mastered'

// A `ProgressBlueprint` instance is a real snapshot at one point in
// time — "Before Learning," "Current Progress," and "After Learning"
// are simply three snapshots with different `state` values, not three
// separate types.
export type ProgressBlueprint = {
  learnerId: string
  documentId: string
  state: LearningTransformationState
  conceptMastery: readonly { conceptNodeId: string; masteryLevel: MasteryLevel }[]
  // "Completion" — 0-1.
  completionPercentage: number
  recordedAt: string
}

// "Learning Proof" — real evidence a future assessment engine
// (Flashcards™, MCQs™, Revision™) would record once it exists.
// `evidenceType` is deliberately an open string, not a closed union —
// future engines will name their own real evidence kinds.
export type LearningProof = {
  learnerId: string
  documentId: string
  conceptNodeId: string
  evidenceType: string
  recordedAt: string
}

// "Transformation Evidence" — the real before/after comparison plus
// every proof that supports it, once real per-learner data exists.
export type TransformationEvidence = {
  learnerId: string
  documentId: string
  before: ProgressBlueprint
  after: ProgressBlueprint | null
  proofs: readonly LearningProof[]
}

// "Motivation Hooks" (Experience Intelligence) — reserved alongside
// Transformation Model since a real motivation hook (e.g. "you just
// reached a milestone") can only ever fire from real per-learner
// progress, which doesn't exist yet. Type only — never populated.
export type MotivationHookType = 'milestone-reached' | 'streak' | 'near-completion' | 'mastery-achieved'

export type MotivationHook = {
  type: MotivationHookType
  learnerId: string
  documentId: string
  conceptNodeId?: string
  message: string
}
