// Learning Knowledge Graph™ (UCE-4) — RESERVED Assessment Layer
// extension point. "Do NOT implement assessment logic. Reserve
// extension points for future engines." Deliberately NOT a field on
// `GraphNode`: assessment/memory data (memory strength, retention,
// quiz history, confidence) is inherently PER-LEARNER, while a
// `LearningKnowledgeGraph` is shared/document-level — one graph serves
// every learner who studies that document. Embedding per-learner state
// on a shared node would either force one node per learner (breaking
// "single source of truth"/concept dedup) or force mutating shared
// state on every learner action. Instead, a future Flashcards™/MCQs™/
// Revision™ engine attaches this type EXTERNALLY, keyed by
// `(learnerId, nodeId)` — a future separate join/table, never a graph
// node field. No logic, no storage here — the shape and this reasoning
// are the whole deliverable this sprint.
export type GraphAssessmentSignals = {
  learnerId: string
  nodeId: string
  // Future engine — how well this learner currently retains this node's content, 0-1.
  memoryStrength?: number
  // Future engine — this learner's real retention score for this node, 0-1.
  retentionScore?: number
  // Future engine — ids/timestamps of this learner's past revision sessions touching this node.
  revisionHistory?: readonly string[]
  // Future engine — this learner's real quiz outcomes for this node.
  quizResults?: readonly string[]
  // Future engine — this learner's self-reported or inferred confidence in this node, 0-1.
  learningConfidence?: number
  // Future engine — open extension bag for signals not yet named here.
  performanceSignals?: Readonly<Record<string, unknown>>
}
