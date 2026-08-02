// The common output shape for every Chunk 2 analyzer/detector/engine
// (ProgressAnalyzer, LearningPatternAnalyzer, WeaknessDetector,
// StrengthDetector, MotivationEngine, GoalTrackingEngine) — one shape,
// discriminated by `type`, rather than a bespoke type per analyzer.
export type MentorInsightType = 'strength' | 'weakness' | 'pattern' | 'progress' | 'motivation' | 'goal'

export type MentorInsight = {
  id: string
  type: MentorInsightType
  summary: string
  detail: string
}
