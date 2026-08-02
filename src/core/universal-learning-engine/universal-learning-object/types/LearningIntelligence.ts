import type { PracticeStrategy, RevisionStrategy } from '@/core/universal-learning-engine/learning-analysis'

// Universal Learning Object™ (UCE-6) — real re-shapes of UCE-5's
// `LearningAnalysis`, never new intelligence. Every value referenced
// here (`revisionPriority`, `suggestedRevisionStrategy`, etc.) is the
// exact real value UCE-5 already computed; this layer only re-sorts/
// re-groups it into a consumer-ready shape (see internal/
// buildRevisionBlueprint.ts and its siblings for the real, disclosed
// sort/group logic).
export type RevisionBlueprintEntry = {
  conceptNodeId: string
  revisionPriority: number
  suggestedStrategy: RevisionStrategy
}

// Real: `analysis.conceptAnalyses` sorted by real `revisionPriority`
// descending — the concepts most urgent to revise first.
export type RevisionBlueprint = {
  entries: readonly RevisionBlueprintEntry[]
}

export type MemoryBlueprintEntry = {
  chunkNodeId: string
  memoryDifficulty: number
}

// Real: `analysis.chunkAnalyses` sorted by real `memoryDifficulty`
// descending — the chunks hardest to retain first.
export type MemoryBlueprint = {
  entries: readonly MemoryBlueprintEntry[]
}

export type PracticeBlueprintEntry = {
  conceptNodeId: string
  importance: number
  suggestedStrategy: PracticeStrategy
}

// Real: `analysis.conceptAnalyses` sorted by real `importance`
// descending — the concepts most worth deliberate practice first.
export type PracticeBlueprint = {
  entries: readonly PracticeBlueprintEntry[]
}

// "Learning Order," "Learning Priority," and "Reading Strategy" (the
// brief's other Learning Intelligence line items) are deliberately NOT
// re-exposed here — they're already real fields on the embedded
// `KnowledgeIntelligence`-adjacent `analysis` object a consumer reaches
// via the top-level `UniversalLearningObject` (`analysis.
// recommendedLearningOrder`, `conceptAnalyses[].learningPriority`,
// `chunkAnalyses[].suggestedReadingStrategy`) — re-exposing them here
// under a new name with no real transformation would be duplicate
// intelligence, not a genuine value-add.
export type LearningIntelligence = {
  revisionBlueprint: RevisionBlueprint
  memoryBlueprint: MemoryBlueprint
  practiceBlueprint: PracticeBlueprint
  // Real sum of every chunk's real `estimatedLearningTimeSeconds`.
  estimatedTotalLearningTimeSeconds: number
  // Real mean of every chunk's real `expectedCognitiveLoad`.
  averageCognitiveLoad: number
}
