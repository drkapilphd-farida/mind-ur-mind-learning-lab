import type { RecommendationCategory } from './RecommendationCategory'
import type { RecommendationItem } from './RecommendationItem'

// Immutable — every field `readonly`. One category's ordered items.
export type RecommendationGroup = {
  readonly category: RecommendationCategory
  readonly items: readonly RecommendationItem[]
}
