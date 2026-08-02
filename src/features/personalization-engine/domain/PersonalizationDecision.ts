import type { PersonalizationRecommendation } from './PersonalizationRecommendation'

// The core immutable decision model — every field `readonly`.
// "Produce immutable decisions" — every recommendation a profile's
// rules produced for one evaluation run, bundled together.
export type PersonalizationDecision = {
  readonly id: string
  readonly profileId: string
  readonly recommendations: readonly PersonalizationRecommendation[]
  readonly generatedAt: string
}
