import type { MentorActivitySnapshot, MentorInsight } from '../types'

// "Mentor Insight Generation" pipeline stage: runs all six first-order
// Chunk 2 analyzers (ProgressAnalyzer, LearningPatternAnalyzer,
// WeaknessDetector, StrengthDetector, MotivationEngine,
// GoalTrackingEngine) against one snapshot and aggregates their output
// — the composition Chunk 2 never built (each analyzer was
// independently callable, but nothing ran them together).
export interface MentorInsightComposer {
  compose(snapshot: MentorActivitySnapshot): Promise<readonly MentorInsight[]>
}
