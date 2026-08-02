// Shared test-only fixtures for this feature's own test suite — same
// convention as `@/features/ai-orchestration-pipeline/testFixtures.ts`,
// whose `makePersonalizationProfile`/`makePersonalizationExecutionPlan`/
// `makePersonalizationRecommendationSet`/`makePersonalizationAdaptation`/
// `makeMemoryContext` builders are replicated here verbatim (local
// re-fixtures for the approved, externally-imported types — not
// imported from that feature's own `testFixtures.ts`, which isn't part
// of its public `index.ts` surface). Not itself a *.test.ts file, so
// vitest's `include` glob never picks it up as a test file. Every
// builder's defaults are valid per this feature's own validators.
import type { PersonalizationAdaptation, PersonalizationExecutionPlan, PersonalizationProfile, PersonalizationRecommendationSet } from '@/features/personalization-engine'
import type { MemoryContext } from '@/features/ai-memory-engine'
import type { RuntimeOrchestrationInputs } from './integration'
import type {
  AIRuntimeResult,
  RuntimeDiagnostics,
  RuntimeExecutionContext,
  RuntimeExecutionPlan,
  RuntimeSuccessResult,
  RuntimeValidation,
} from './types'

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

export function makeRuntimeOrchestrationInputs(overrides: Partial<RuntimeOrchestrationInputs> = {}): RuntimeOrchestrationInputs {
  return {
    learnerId: 'learner-1',
    profileId: 'profile-1',
    profile: makePersonalizationProfile(),
    executionPlan: makePersonalizationExecutionPlan(),
    recommendationSet: makePersonalizationRecommendationSet(),
    adaptation: makePersonalizationAdaptation(),
    memoryContext: makeMemoryContext(),
    configurationFacts: {},
    systemPrompt: 'You are a helpful learning mentor.',
    userPrompt: 'Help me understand fractions.',
    requestedCapability: null,
    preferredProviderId: null,
    preferredModelId: null,
    minimumContextSize: null,
    requestConfiguration: { temperature: 0.7, maxOutputTokens: 1024 },
    safetyConfiguration: { moderationEnabled: true, blockedTerms: [] },
    ...overrides,
  }
}

export function makeRuntimeExecutionContext(overrides: Partial<RuntimeExecutionContext> = {}): RuntimeExecutionContext {
  return { learnerId: 'learner-1', profileId: 'profile-1', state: 'pending', completedStages: ['pending'], ...overrides }
}

export function makeRuntimeExecutionPlan(overrides: Partial<RuntimeExecutionPlan> = {}): RuntimeExecutionPlan {
  return {
    plannedStages: [
      'pending',
      'personalization-ready',
      'recommendation-ready',
      'mentor-ready',
      'provider-selected',
      'model-selected',
      'request-ready',
      'adapter-processed',
      'response-ready',
      'completed',
    ],
    preferredProviderId: null,
    preferredModelId: null,
    requestedCapability: null,
    minimumContextSize: null,
    ...overrides,
  }
}

export function makeRuntimeSuccessResult(overrides: Partial<RuntimeSuccessResult> = {}): RuntimeSuccessResult {
  return { responseText: 'Echo: Help me understand fractions.', providerId: 'openai', modelId: 'gpt-4o', finishReason: 'stop', ...overrides }
}

export function makeRuntimeValidation(overrides: Partial<RuntimeValidation> = {}): RuntimeValidation {
  return { valid: true, issues: [], ...overrides }
}

export function makeRuntimeDiagnostics(overrides: Partial<RuntimeDiagnostics> = {}): RuntimeDiagnostics {
  return {
    learnerId: 'learner-1',
    profileId: 'profile-1',
    finalState: 'completed',
    completedStages: ['pending', 'completed'],
    validationResult: makeRuntimeValidation(),
    selectedProviderId: 'openai',
    selectedModelId: 'gpt-4o',
    ...overrides,
  }
}

export function makeAIRuntimeResult(overrides: Partial<AIRuntimeResult> = {}): AIRuntimeResult {
  return {
    state: 'completed',
    completionStatus: 'completed',
    success: makeRuntimeSuccessResult(),
    failureReason: null,
    diagnostics: makeRuntimeDiagnostics(),
    ...overrides,
  }
}
