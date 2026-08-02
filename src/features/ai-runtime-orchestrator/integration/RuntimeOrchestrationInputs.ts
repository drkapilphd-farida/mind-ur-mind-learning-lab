import type { PersonalizationAdaptation, PersonalizationExecutionPlan, PersonalizationProfile, PersonalizationRecommendationSet } from '@/features/personalization-engine'
import type { MemoryContext } from '@/features/ai-memory-engine'
import type { RuntimeConfigurationFacts, RuntimeRequestConfiguration, RuntimeSafetyConfiguration } from '../types'

// The real, cross-feature entry-point input — the *only* file (with
// `../testFixtures.ts`) that imports `PersonalizationProfile`/
// `PersonalizationExecutionPlan`/`PersonalizationRecommendationSet`/
// `PersonalizationAdaptation` from `@/features/personalization-engine`
// and `MemoryContext` from `@/features/ai-memory-engine`. Mirrors
// `ai-orchestration-pipeline/integration/AIOrchestrationInputs.ts`'s
// own field set (fed unchanged into
// `../coordination/DefaultRuntimeCoordinator.ts`'s first real call),
// plus this sprint's own new fields carrying the prompt/selection/
// configuration facts the Sprint 37-40 chain needs.
export type RuntimeOrchestrationInputs = {
  readonly learnerId: string
  readonly profileId: string
  readonly profile: PersonalizationProfile
  readonly executionPlan: PersonalizationExecutionPlan
  readonly recommendationSet: PersonalizationRecommendationSet
  readonly adaptation: PersonalizationAdaptation
  readonly memoryContext: MemoryContext | null
  readonly configurationFacts: RuntimeConfigurationFacts

  readonly systemPrompt: string
  readonly userPrompt: string
  readonly requestedCapability: string | null
  readonly preferredProviderId: string | null
  readonly preferredModelId: string | null
  readonly minimumContextSize: number | null
  readonly requestConfiguration: RuntimeRequestConfiguration
  readonly safetyConfiguration: RuntimeSafetyConfiguration
}
