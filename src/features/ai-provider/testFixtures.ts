// Shared test-only fixtures for this feature's own test suite — same
// convention as `@/features/ai-mentor/testFixtures.ts` and
// `@/features/learning-intelligence/testFixtures.ts`. Not itself a
// *.test.ts file, so vitest's `include` glob never picks it up as a
// test file.
import type { Clock, IdGenerator } from './contracts'
import type { AIModel, AIModelCapabilities, AIProviderConfiguration, AIRequest, ProviderMetadata, ProviderSelectionCriteria } from './types'
import { CHAT_CAPABILITIES } from './providers'
import { DEFAULT_RATE_LIMIT_POLICY, DEFAULT_RETRY_POLICY } from './configuration'

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

export function makeCapabilities(overrides: Partial<AIModelCapabilities> = {}): AIModelCapabilities {
  return { ...CHAT_CAPABILITIES, ...overrides }
}

export function makeProviderMetadata(overrides: Partial<ProviderMetadata> = {}): ProviderMetadata {
  return {
    id: 'test-provider',
    displayName: 'Test Provider',
    description: 'A fixture provider for this feature\'s own tests.',
    supportsFineTuning: false,
    ...overrides,
  }
}

export function makeAIModel(overrides: Partial<AIModel> = {}): AIModel {
  return {
    id: 'test-model',
    displayName: 'Test Model',
    providerId: 'test-provider',
    capabilities: makeCapabilities(),
    contextWindowTokens: 10_000,
    maxOutputTokens: 1_000,
    ...overrides,
  }
}

export function makeAIRequest(overrides: Partial<AIRequest> = {}): AIRequest {
  return {
    id: 'request-1',
    modelId: 'test-model',
    messages: [{ role: 'user', content: 'Hello' }],
    ...overrides,
  }
}

export function makeProviderConfiguration(overrides: Partial<AIProviderConfiguration> = {}): AIProviderConfiguration {
  return {
    providerId: 'test-provider',
    preferredModelId: 'test-model',
    retryPolicy: DEFAULT_RETRY_POLICY,
    rateLimitPolicy: DEFAULT_RATE_LIMIT_POLICY,
    ...overrides,
  }
}

export function makeSelectionCriteria(overrides: Partial<ProviderSelectionCriteria> = {}): ProviderSelectionCriteria {
  return { ...overrides }
}
