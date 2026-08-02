import type { PersonalizationRecommendationSet } from '@/features/personalization-engine'
import type { MentorRecommendationSet } from '../types'

// Pure — reduces a "Recommendation Results" input (a real
// `PersonalizationRecommendationSet` from the approved Personalization
// Engine™) down to a flat, self-contained `MentorRecommendationSet`.
// This is the *only* place `PersonalizationRecommendationSet`'s own
// shape is inspected — nothing in `../types/` or `../contextAssembly/`
// knows this type exists.
export function buildMentorRecommendationSet(recommendationSet: PersonalizationRecommendationSet | null): MentorRecommendationSet {
  if (!recommendationSet) return { items: [] }

  const items = recommendationSet.groups.flatMap((group) =>
    group.items.map((item) => ({ category: group.category, referenceId: item.referenceId, priority: item.priority })),
  )

  return { items }
}
