import type { PersonalizationFacts, PersonalizationProfile } from '../domain'
import type { PersonalizationRecommendationSet } from '../recommendationDomain'

// "Personalization Profile, Recommendation Results, Learning Progress,
// Assessment Results, Memory Context, Configuration Policies" — the
// Sprint 27 brief's own Section 2 input list, verbatim. Every field is
// a same-feature type reused directly (`profile` from Sprint 23,
// `recommendationSet` from Sprint 26) or an already-reduced flat facts
// shape — real reduction from "approved infrastructure" happens in
// `../integration/buildAdaptationEvaluatorInputs.ts`.
export type AdaptationEvaluatorInputs = {
  readonly learnerId: string
  readonly profile: PersonalizationProfile
  readonly recommendationSet: PersonalizationRecommendationSet
  readonly assessmentResults: PersonalizationFacts
  readonly learningProgress: PersonalizationFacts
  readonly memoryFacts: PersonalizationFacts
  readonly configurationFacts: PersonalizationFacts
}
