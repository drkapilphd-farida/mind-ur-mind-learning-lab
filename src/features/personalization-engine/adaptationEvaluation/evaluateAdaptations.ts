import {
  evaluateDifficultyAdjustment,
  evaluateLearningSequenceAdjustment,
  evaluateRecommendationRefinement,
  evaluateReviewFrequencyAdjustment,
  evaluateSessionLengthAdjustment,
} from '../adaptationRules'
import type { PersonalizationAdaptation } from '../adaptationDomain'
import type { AdaptationEvaluatorInputs } from './AdaptationEvaluatorInputs'

// Pure — "Evaluate deterministic inputs ... No AI inference." Runs all
// 5 fixed adaptation rules, in the Sprint 27 brief's own Section 3
// order, and always keeps every result — applied or rejected — so
// diagnostics can count both.
export function evaluateAdaptations(inputs: AdaptationEvaluatorInputs, now: string, id: string): PersonalizationAdaptation {
  const results = [
    evaluateDifficultyAdjustment(inputs.assessmentResults),
    evaluateReviewFrequencyAdjustment(inputs.learningProgress),
    evaluateSessionLengthAdjustment(inputs.recommendationSet, inputs.configurationFacts),
    evaluateLearningSequenceAdjustment(inputs.recommendationSet),
    evaluateRecommendationRefinement(inputs.recommendationSet),
  ]

  return {
    id,
    version: 1,
    profileId: inputs.profile.id,
    results,
    metadata: { learnerId: inputs.learnerId, profileId: inputs.profile.id, source: 'adaptation-evaluator', generatedAt: now },
  }
}
