import type {
  PersonalizationAdaptation,
  PersonalizationExecutionPlan,
  PersonalizationProfile,
  PersonalizationRecommendationSet,
} from '@/features/personalization-engine'
import type { MemoryContext } from '@/features/ai-memory-engine'
import type { ProviderProfileId } from '@/features/provider-translation-engine'
import type { OrchestrationConfigurationFacts } from '../types'

// The real, cross-feature-bearing root input for one end-to-end
// orchestration run — "Coordinate the following existing components
// only" (§2). `profile`/`executionPlan`/`recommendationSet`/`adaptation`
// (Personalization Engine™, already carrying Adaptive Learning
// Planner™'s own contribution per Sprint 25) and `memoryContext` (AI
// Memory Engine™) are fed straight through to
// `ai-mentor-personalization-bridge`'s own orchestrator — this feature
// never recomputes any of them ("No business logic duplication").
export type AIOrchestrationInputs = {
  readonly learnerId: string
  readonly profileId: string
  readonly providerId: ProviderProfileId
  readonly profile: PersonalizationProfile
  readonly executionPlan: PersonalizationExecutionPlan
  readonly recommendationSet: PersonalizationRecommendationSet
  readonly adaptation: PersonalizationAdaptation
  readonly memoryContext: MemoryContext | null
  readonly configurationFacts: OrchestrationConfigurationFacts
}
