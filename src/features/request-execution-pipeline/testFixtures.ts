// Shared test-only fixtures for this feature's own test suite — same
// convention as `@/features/provider-translation-engine/testFixtures.ts`.
// Not itself a *.test.ts file, so vitest's `include` glob never picks
// it up as a test file. Every builder's defaults are valid per this
// feature's own validator, so tests only need to override the one
// field under test.
import type { Clock, IdGenerator } from './contracts'
import type {
  PipelineResult,
  PromptPayload,
  RequestBuilderInputs,
  RequestConfiguration,
  RequestContext,
  RequestEnvelope,
  RequestExecutionDiagnostics,
  RequestMetadata,
  RequestValidationResult,
  SafetyConfiguration,
} from './types'

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

export function makePromptPayload(overrides: Partial<PromptPayload> = {}): PromptPayload {
  return { systemPrompt: 'You are a helpful learning mentor.', userPrompt: 'Help me understand fractions.', ...overrides }
}

export function makeRequestConfiguration(overrides: Partial<RequestConfiguration> = {}): RequestConfiguration {
  return { temperature: 0.7, maxOutputTokens: 1024, ...overrides }
}

export function makeSafetyConfiguration(overrides: Partial<SafetyConfiguration> = {}): SafetyConfiguration {
  return { moderationEnabled: true, blockedTerms: [], ...overrides }
}

export function makeRequestContext(overrides: Partial<RequestContext> = {}): RequestContext {
  return { learnerId: 'learner-1', profileId: 'profile-1', providerId: 'openai', modelId: 'gpt-4o', ...overrides }
}

export function makeRequestMetadata(overrides: Partial<RequestMetadata> = {}): RequestMetadata {
  return { learnerId: 'learner-1', profileId: 'profile-1', source: 'request-execution-pipeline', generatedAt: '2026-01-01T00:00:00.000Z', ...overrides }
}

export function makeRequestEnvelope(overrides: Partial<RequestEnvelope> = {}): RequestEnvelope {
  return {
    id: 'request-1',
    context: makeRequestContext(),
    payload: makePromptPayload(),
    metadata: makeRequestMetadata(),
    configuration: makeRequestConfiguration(),
    safetyConfiguration: makeSafetyConfiguration(),
    ...overrides,
  }
}

export function makeRequestBuilderInputs(overrides: Partial<RequestBuilderInputs> = {}): RequestBuilderInputs {
  return {
    learnerId: 'learner-1',
    profileId: 'profile-1',
    providerId: 'openai',
    modelId: 'gpt-4o',
    systemPrompt: 'You are a helpful learning mentor.',
    userPrompt: 'Help me understand fractions.',
    configuration: makeRequestConfiguration(),
    safetyConfiguration: makeSafetyConfiguration(),
    ...overrides,
  }
}

export function makeRequestValidationResult(overrides: Partial<RequestValidationResult> = {}): RequestValidationResult {
  return { valid: true, issues: [], ...overrides }
}

export function makeRequestExecutionDiagnostics(overrides: Partial<RequestExecutionDiagnostics> = {}): RequestExecutionDiagnostics {
  return {
    requestId: 'request-1',
    providerId: 'openai',
    modelId: 'gpt-4o',
    validationResult: makeRequestValidationResult(),
    systemPromptLength: 30,
    userPromptLength: 27,
    normalizationApplied: true,
    ...overrides,
  }
}

export function makePipelineResult(overrides: Partial<PipelineResult> = {}): PipelineResult {
  return {
    envelope: makeRequestEnvelope(),
    validationResult: makeRequestValidationResult(),
    diagnostics: makeRequestExecutionDiagnostics(),
    ...overrides,
  }
}
