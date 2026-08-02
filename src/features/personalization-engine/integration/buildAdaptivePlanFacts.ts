import type { AdaptiveLearningPlan } from '@/features/adaptive-learning-planner'
import type { AdaptivePlanExecutionFacts } from '../executionDomain'

// Pure — reduces an "Adaptive Learning Planner inputs" value (a real
// `AdaptiveLearningPlan` from the approved Adaptive Learning Planner™)
// down to the flat facts `executionSequencing/` and `executionPlanning/`
// read. This is the *only* place `AdaptiveLearningPlan`'s own shape is
// inspected — nothing in `executionDomain/`, `executionSequencing/`, or
// `executionPlanning/` knows this type exists.
export function buildAdaptivePlanFacts(adaptivePlan: AdaptiveLearningPlan | null): AdaptivePlanExecutionFacts {
  if (!adaptivePlan) return { journey: null, exerciseIds: [], difficultyLevel: null, sessionDurationMinutes: null, milestoneIds: [] }

  return {
    journey: adaptivePlan.recommendedJourney || null,
    exerciseIds: adaptivePlan.recommendedExercises.map((exercise) => exercise.exerciseId),
    difficultyLevel: adaptivePlan.difficultyLevel,
    sessionDurationMinutes: adaptivePlan.dailyDurationMinutes,
    milestoneIds: adaptivePlan.learningMilestones.map((milestone) => milestone.id),
  }
}
