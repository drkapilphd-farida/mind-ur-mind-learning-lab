import type { PersonalizationContext, PersonalizationDecision, PersonalizationProfile } from '../domain'

// "Supported inputs: Personalization Profile, Personalization
// Decisions, Assessment Results, Learning Progress, Memory Context" —
// the Sprint 24 brief's own Section 3 list. Every type here is reused
// directly from `../domain` (Sprint 23, same feature) — `context`
// already carries assessment results, learning progress, and memory
// context as its own three facts buckets, so no separate fields are
// needed for those.
export type StrategyEvaluationInputs = {
  readonly profile: PersonalizationProfile
  readonly decisions: readonly PersonalizationDecision[]
  readonly context: PersonalizationContext
}
