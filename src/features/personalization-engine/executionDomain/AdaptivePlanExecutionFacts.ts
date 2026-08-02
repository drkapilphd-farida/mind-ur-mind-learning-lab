// A flat, self-contained reduction of the Adaptive Learning Planner's™
// own `AdaptiveLearningPlan` — same convention as `PersonalizationFacts`
// (Sprint 23): everything `executionSequencing/` and `executionPlanning/`
// read is a flat, primitive-valued field, never a reference to
// `@/features/adaptive-learning-planner`'s own domain type. The real
// reduction happens in `../integration/buildAdaptivePlanFacts.ts` — the
// *only* file that imports `AdaptiveLearningPlan` itself.
export type AdaptivePlanExecutionFacts = {
  readonly journey: string | null
  readonly exerciseIds: readonly string[]
  readonly difficultyLevel: string | null
  readonly sessionDurationMinutes: number | null
  readonly milestoneIds: readonly string[]
}
