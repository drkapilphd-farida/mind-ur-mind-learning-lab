import type { ConceptRole } from '@/core/universal-learning-engine/knowledge-graph'

// AI Learning Analysis Engine™ (UCE-5). Real, deterministic, always
// computed defaults — threshold classifications over real inputs (see
// internal/computeConceptMetrics.ts), never an AI call by default.
export type RevisionStrategy = 'periodic-review' | 'spaced-repetition' | 'intensive-review'
export type PracticeStrategy = 'light-practice' | 'guided-practice' | 'deliberate-practice'

// The one genuinely AI-derived piece this sprint — optional, and only
// ever produced for `conceptRole === 'core'` concepts (see
// buildLearningAnalysis.ts). `confidence` is the model's own
// self-reported value, the same disclosed-honesty pattern as UCE-3B/
// UCE-4's AI-derived confidence fields — never fabricated.
export type AIRefinedStrategy = {
  readingStrategyNotes: string
  revisionStrategyNotes: string
  practiceStrategyNotes: string
  confidence: number
}

// Real, per-concept analysis. `conceptNodeId` matches a real
// `ConceptGraphNode.id` from the input `LearningKnowledgeGraph` — this
// object never duplicates the graph node itself, only adds analysis
// alongside it by reference.
export type ConceptAnalysis = {
  conceptNodeId: string
  // Real 0-1 composite of occurrenceCount, real graph degree, and the
  // mean real `enrichment.importance` across chunks covering this
  // concept — see internal/computeConceptMetrics.ts.
  importance: number
  // Real 0-1 composite of importance and difficulty-adjusted urgency.
  learningPriority: number
  // Real, threshold-classified — reuses knowledge-graph's own
  // `ConceptRole` type verbatim (never redefined here).
  conceptRole: ConceptRole
  // Real: how many other concepts real depend-on/prerequisite edges
  // point at this one (in-degree) — a foundational concept many things
  // depend on has real revision urgency.
  revisionPriority: number
  // Real position in the real topological `recommendedLearningOrder` on
  // `LearningAnalysis` — `null` only when this concept is part of a
  // real detected cycle (see PrerequisiteValidation.ts), since no valid
  // order exists for it.
  recommendedOrder: number | null
  // Real, transitive prerequisite closure (BFS over prerequisite/
  // depends-on edges) — every concept this one genuinely depends on,
  // directly or indirectly, in dependency order.
  dependencyChain: readonly string[]
  suggestedRevisionStrategy: RevisionStrategy
  suggestedPracticeStrategy: PracticeStrategy
  // Optional — only present when `options.aiFoundation` was supplied
  // AND this concept is real 'core'. Absent for every other concept —
  // never a fabricated placeholder.
  aiRefinedStrategy?: AIRefinedStrategy
}
