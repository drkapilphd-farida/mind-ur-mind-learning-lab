import type { RecommendationCategory } from './RecommendationCategory'
import type { RecommendationPriority } from './RecommendationPriority'

// Immutable — every field `readonly`. One recommended thing within a
// group.
export type RecommendationItem = {
  readonly id: string
  readonly category: RecommendationCategory
  readonly referenceId: string
  readonly priority: RecommendationPriority
  readonly rationale: string
}
