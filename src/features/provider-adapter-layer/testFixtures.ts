// Shared test-only fixtures for this feature's own test suite — same
// convention as `@/features/provider-execution-engine/testFixtures.ts`.
// Not itself a *.test.ts file, so vitest's `include` glob never picks
// it up as a test file. `makeExecutionRequest` is a local fixture for
// the one approved, externally-imported type (not imported from that
// feature's own `testFixtures.ts`, which isn't part of its public
// `index.ts` surface) — it constructs the same shape independently.
// Every other `make<Type>` builder's defaults are valid per this
// feature's own validators, so tests only need to override the one
// field under test.
import type { ExecutionRequest } from '@/features/provider-execution-engine'
import type {
  ProviderAdapterCapabilities,
  ProviderAdapterConfiguration,
  ProviderAdapterExecutionRequest,
  ProviderAdapterExecutionResult,
  ProviderAdapterMetadata,
  ProviderAdapterNormalizedResponse,
  ProviderAdapterPayload,
  ProviderAdapterRawResponse,
  ProviderAdapterTransformedRequest,
} from './types'

export function makeExecutionRequest(overrides: Partial<ExecutionRequest> = {}): ExecutionRequest {
  return {
    id: 'request-1',
    providerId: 'openai',
    messageCount: 2,
    instructionCount: 1,
    payloadSummary: ['system', 'user'],
    ...overrides,
  }
}

export function makeProviderAdapterConfiguration(overrides: Partial<ProviderAdapterConfiguration> = {}): ProviderAdapterConfiguration {
  return { temperature: 0.7, maxOutputTokens: 1024, ...overrides }
}

export function makeProviderAdapterMetadata(overrides: Partial<ProviderAdapterMetadata> = {}): ProviderAdapterMetadata {
  return {
    providerId: 'openai',
    providerName: 'OpenAI',
    providerVersion: '1.0.0',
    supportedModels: ['gpt-4o', 'gpt-4o-mini'],
    maximumContext: 128000,
    maximumOutput: 16384,
    supportedFeatures: ['chat-completion', 'vision', 'function-calling', 'json-output', 'streaming-support', 'multimodal'],
    defaultConfiguration: makeProviderAdapterConfiguration(),
    ...overrides,
  }
}

export function makeProviderAdapterCapabilities(overrides: Partial<ProviderAdapterCapabilities> = {}): ProviderAdapterCapabilities {
  return { providerId: 'openai', supported: ['chat-completion', 'vision'], ...overrides }
}

export function makeProviderAdapterExecutionRequest(overrides: Partial<ProviderAdapterExecutionRequest> = {}): ProviderAdapterExecutionRequest {
  return { id: 'request-1', providerId: 'openai', messageCount: 2, instructionCount: 1, payloadSummary: ['system', 'user'], ...overrides }
}

export function makeProviderAdapterTransformedRequest(overrides: Partial<ProviderAdapterTransformedRequest> = {}): ProviderAdapterTransformedRequest {
  return { providerId: 'openai', messageCount: 2, instructionCount: 1, payloadSummary: ['system', 'user'], ...overrides }
}

export function makeProviderAdapterPayload(overrides: Partial<ProviderAdapterPayload> = {}): ProviderAdapterPayload {
  return {
    providerId: 'openai',
    model: 'gpt-4o',
    messageCount: 2,
    instructionCount: 1,
    payloadSummary: ['system', 'user'],
    configuration: makeProviderAdapterConfiguration(),
    ...overrides,
  }
}

export function makeProviderAdapterRawResponse(overrides: Partial<ProviderAdapterRawResponse> = {}): ProviderAdapterRawResponse {
  return { providerId: 'openai', outputText: 'Hello from the adapter.', finishReason: 'stop', modelUsed: 'gpt-4o', ...overrides }
}

export function makeProviderAdapterNormalizedResponse(overrides: Partial<ProviderAdapterNormalizedResponse> = {}): ProviderAdapterNormalizedResponse {
  return { providerId: 'openai', text: 'Hello from the adapter.', finishReason: 'stop', modelUsed: 'gpt-4o', ...overrides }
}

export function makeProviderAdapterExecutionResult(overrides: Partial<ProviderAdapterExecutionResult> = {}): ProviderAdapterExecutionResult {
  return { sessionId: 'session-1', succeeded: true, outputText: 'Hello from the adapter.', finishReason: 'stop', ...overrides }
}
