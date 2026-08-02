// Shared test-only fixtures for this feature's own test suite — same
// convention as every prior sprint's `testFixtures.ts`. Not itself a
// *.test.ts file, so vitest's `include` glob never picks it up as a
// test file. The 5 `make<External>` fixtures below are local
// re-fixtures for the approved, externally-imported types (not
// imported from those features' own `testFixtures.ts`, which isn't
// part of their public `index.ts` surface) — they construct the same
// shapes independently, deliberately shaped so a full 6-stage
// end-to-end run through the real pipeline validates successfully at
// every stage.
import type {
  PersonalizationAdaptation,
  PersonalizationExecutionPlan,
  PersonalizationProfile,
  PersonalizationRecommendationSet,
} from '@/features/personalization-engine'
import type { MemoryContext } from '@/features/ai-memory-engine'
import type { ProviderExecutionRequest } from '@/features/provider-request-pipeline'
import type { Clock, IdGenerator } from './contracts'
import type { AIOrchestrationContext, AIOrchestrationMetadata, AIOrchestrationResult, OrchestrationConfigurationFacts } from './types'
import type { AIOrchestrationInputs } from './integration'

export function makeFixedClock(fixedNow = '2026-01-01T00:00:00.000Z'): Clock {
  return { now: () => fixedNow }
}

export function makeSequentialIdGenerator(prefix = 'id'): IdGenerator {
  let counter = 0
  return {
    generate: () => {
      counter += 1
      return `${prefix}-${counter}`
    },
  }
}

export function makePersonalizationProfile(overrides: Partial<PersonalizationProfile> = {}): PersonalizationProfile {
  return {
    id: 'profile-1',
    lifecycle: 'active',
    rules: [],
    metadata: { learnerId: 'learner-1', source: 'test', tags: [] },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export function makePersonalizationExecutionPlan(overrides: Partial<PersonalizationExecutionPlan> = {}): PersonalizationExecutionPlan {
  return {
    id: 'plan-1',
    version: 1,
    sequences: [
      { type: 'journey', steps: [{ id: 'j1', sequenceType: 'journey', referenceId: 'journey-a', order: 0, priority: 'high', detail: 'Recommended journey' }] },
      { type: 'difficulty', steps: [{ id: 'd1', sequenceType: 'difficulty', referenceId: 'advanced', order: 0, priority: 'high', detail: 'Difficulty level' }] },
    ],
    metadata: { learnerId: 'learner-1', profileId: 'profile-1', source: 'test', generatedAt: '2026-01-01T00:00:00.000Z' },
    ...overrides,
  }
}

export function makePersonalizationRecommendationSet(overrides: Partial<PersonalizationRecommendationSet> = {}): PersonalizationRecommendationSet {
  return {
    id: 'set-1',
    version: 1,
    groups: [{ category: 'exercise', items: [{ id: 'r1', category: 'exercise', referenceId: 'ex-1', priority: 'high', rationale: 'test' }] }],
    metadata: { learnerId: 'learner-1', profileId: 'profile-1', source: 'test', generatedAt: '2026-01-01T00:00:00.000Z' },
    ...overrides,
  }
}

export function makePersonalizationAdaptation(overrides: Partial<PersonalizationAdaptation> = {}): PersonalizationAdaptation {
  return {
    id: 'adaptation-1',
    version: 1,
    profileId: 'profile-1',
    results: [{ ruleId: 'difficulty-adjustment', type: 'difficulty', value: 'no-change', applied: false, priority: 'low', reason: 'test' }],
    metadata: { learnerId: 'learner-1', profileId: 'profile-1', source: 'test', generatedAt: '2026-01-01T00:00:00.000Z' },
    ...overrides,
  }
}

export function makeMemoryContext(overrides: Partial<MemoryContext> = {}): MemoryContext {
  return {
    learnerId: 'learner-1',
    sections: [{ category: 'assessment', summaries: ['A short memory summary.'] }],
    generatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export function makeProviderExecutionRequest(overrides: Partial<ProviderExecutionRequest> = {}): ProviderExecutionRequest {
  return {
    id: 'exec-request-1',
    version: 1,
    providerId: 'openai',
    modelId: 'gpt-4o-mini',
    context: { learnerId: 'learner-1', profileId: 'profile-1', facts: ['active'] },
    options: { temperature: 0.7, maxOutputTokens: 1024 },
    messages: [{ role: 'user', content: 'value' }],
    instructions: [{ id: 'system-baseline', directive: 'maintain-mentor-persona' }],
    metadata: { learnerId: 'learner-1', profileId: 'profile-1', source: 'provider-request-pipeline', generatedAt: '2026-01-01T00:00:00.000Z' },
    ...overrides,
  }
}

export function makeAIOrchestrationMetadata(overrides: Partial<AIOrchestrationMetadata> = {}): AIOrchestrationMetadata {
  return { learnerId: 'learner-1', profileId: 'profile-1', source: 'test', generatedAt: '2026-01-01T00:00:00.000Z', ...overrides }
}

export function makeAIOrchestrationContext(overrides: Partial<AIOrchestrationContext> = {}): AIOrchestrationContext {
  return {
    learnerId: 'learner-1',
    profileId: 'profile-1',
    stage: 'completed',
    completedStages: ['initialized', 'context-ready', 'prompt-ready', 'request-ready', 'response-normalized', 'completed'],
    ...overrides,
  }
}

export function makeAIOrchestrationResult(overrides: Partial<AIOrchestrationResult> = {}): AIOrchestrationResult {
  return {
    id: 'orchestration-1',
    version: 1,
    context: makeAIOrchestrationContext(),
    completionStatus: 'completed',
    responseText: 'hello',
    providerId: 'openai',
    metadata: makeAIOrchestrationMetadata(),
    ...overrides,
  }
}

export function makeOrchestrationConfigurationFacts(overrides: OrchestrationConfigurationFacts = {}): OrchestrationConfigurationFacts {
  return { ...overrides }
}

export function makeAIOrchestrationInputs(overrides: Partial<AIOrchestrationInputs> = {}): AIOrchestrationInputs {
  return {
    learnerId: 'learner-1',
    profileId: 'profile-1',
    providerId: 'openai',
    profile: makePersonalizationProfile(),
    executionPlan: makePersonalizationExecutionPlan(),
    recommendationSet: makePersonalizationRecommendationSet(),
    adaptation: makePersonalizationAdaptation(),
    memoryContext: makeMemoryContext(),
    configurationFacts: {},
    ...overrides,
  }
}
