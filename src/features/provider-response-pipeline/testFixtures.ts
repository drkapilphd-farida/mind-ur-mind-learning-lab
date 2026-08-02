// Shared test-only fixtures for this feature's own test suite — same
// convention as `@/features/provider-request-pipeline/testFixtures.ts`.
// Not itself a *.test.ts file, so vitest's `include` glob never picks
// it up as a test file. `makeProviderExecutionRequest` is a local
// fixture for the approved, externally-imported type (not imported
// from that feature's own `testFixtures.ts`, which isn't part of its
// public `index.ts` surface) — it constructs the same shape
// independently.
import type { ProviderExecutionRequest } from '@/features/provider-request-pipeline'
import type { Clock, IdGenerator } from './contracts'
import type {
  ProviderExecutionResponse,
  ProviderResponseContent,
  ProviderResponseMetadata,
  ProviderUsageStatistics,
  ResponseConfigurationFacts,
} from './types'
import type { AnthropicRawResponse, GeminiRawResponse, OpenAIRawResponse, RawProviderResponse, ResponseNormalizationInputs } from './translation'
import type { ResponseOrchestrationInputs } from './integration'

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

export function makeProviderExecutionRequest(overrides: Partial<ProviderExecutionRequest> = {}): ProviderExecutionRequest {
  return {
    id: 'exec-request-1',
    version: 1,
    providerId: 'openai',
    modelId: 'gpt-4o-mini',
    context: { learnerId: 'learner-1', profileId: 'profile-1', facts: ['active'] },
    options: { temperature: 0.7, maxOutputTokens: 1024 },
    messages: [{ role: 'user', content: 'value' }],
    instructions: [{ id: 'system-baseline', directive: 'maintain-mentor-persona' }, { id: 'safety-baseline', directive: 'enforce-standard-safety-level' }],
    metadata: { learnerId: 'learner-1', profileId: 'profile-1', source: 'provider-request-pipeline', generatedAt: '2026-01-01T00:00:00.000Z' },
    ...overrides,
  }
}

export function makeOpenAIRawResponse(overrides: Partial<OpenAIRawResponse> = {}): OpenAIRawResponse {
  return {
    choices: [{ message: { content: 'hello' }, finish_reason: 'stop' }],
    usage: { prompt_tokens: 10, completion_tokens: 5 },
    ...overrides,
  }
}

export function makeAnthropicRawResponse(overrides: Partial<AnthropicRawResponse> = {}): AnthropicRawResponse {
  return {
    content: [{ text: 'hello' }],
    stop_reason: 'end_turn',
    usage: { input_tokens: 10, output_tokens: 5 },
    ...overrides,
  }
}

export function makeGeminiRawResponse(overrides: Partial<GeminiRawResponse> = {}): GeminiRawResponse {
  return {
    candidates: [{ content: { parts: [{ text: 'hello' }] }, finishReason: 'STOP' }],
    usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5 },
    ...overrides,
  }
}

export function makeResponseNormalizationInputs(overrides: Partial<ResponseNormalizationInputs> = {}): ResponseNormalizationInputs {
  return { learnerId: 'learner-1', profileId: 'profile-1', ...overrides }
}

export function makeProviderResponseMetadata(overrides: Partial<ProviderResponseMetadata> = {}): ProviderResponseMetadata {
  return { learnerId: 'learner-1', profileId: 'profile-1', source: 'test', generatedAt: '2026-01-01T00:00:00.000Z', ...overrides }
}

export function makeProviderUsageStatistics(overrides: Partial<ProviderUsageStatistics> = {}): ProviderUsageStatistics {
  return { promptTokens: 10, completionTokens: 5, totalTokens: 15, ...overrides }
}

export function makeProviderResponseContent(overrides: Partial<ProviderResponseContent> = {}): ProviderResponseContent {
  return { text: 'hello', finishReason: 'stop', ...overrides }
}

export function makeProviderExecutionResponse(overrides: Partial<ProviderExecutionResponse> = {}): ProviderExecutionResponse {
  return {
    id: 'response-1',
    version: 1,
    providerId: 'openai',
    content: makeProviderResponseContent(),
    usage: makeProviderUsageStatistics(),
    safetyFlags: [],
    metadata: makeProviderResponseMetadata(),
    ...overrides,
  }
}

export function makeResponseConfigurationFacts(overrides: ResponseConfigurationFacts = {}): ResponseConfigurationFacts {
  return { ...overrides }
}

export function makeRawProviderResponse(overrides: Partial<RawProviderResponse> = {}): RawProviderResponse {
  return { providerId: 'openai', response: makeOpenAIRawResponse(), ...overrides } as RawProviderResponse
}

export function makeResponseOrchestrationInputs(overrides: Partial<ResponseOrchestrationInputs> = {}): ResponseOrchestrationInputs {
  return {
    learnerId: 'learner-1',
    profileId: 'profile-1',
    executionRequest: makeProviderExecutionRequest(),
    rawResponse: makeRawProviderResponse(),
    configurationFacts: {},
    ...overrides,
  }
}
