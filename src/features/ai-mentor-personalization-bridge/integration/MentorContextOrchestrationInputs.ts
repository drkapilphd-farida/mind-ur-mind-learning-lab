import type {
  PersonalizationAdaptation,
  PersonalizationExecutionPlan,
  PersonalizationProfile,
  PersonalizationRecommendationSet,
} from '@/features/personalization-engine'
import type { MemoryContext } from '@/features/ai-memory-engine'
import type { MentorConfigurationFacts } from '../types'

// The raw, nullable, cross-feature inputs a caller supplies for one
// mentor-context-orchestration run. Nullable throughout — "Missing
// personalization / Missing execution plan / Missing recommendations"
// (§3) are real, checkable states, not caller errors.
export type MentorContextOrchestrationInputs = {
  readonly learnerId: string
  readonly profileId: string
  readonly profile: PersonalizationProfile | null
  readonly executionPlan: PersonalizationExecutionPlan | null
  readonly recommendationSet: PersonalizationRecommendationSet | null
  readonly adaptation: PersonalizationAdaptation | null
  readonly memoryContext: MemoryContext | null
  readonly configurationFacts: MentorConfigurationFacts
}
