// Shared test-only fixtures for this feature's own test suite — same
// convention as `@/features/provider-translation-engine/testFixtures.ts`.
// Not itself a *.test.ts file, so vitest's `include` glob never picks
// it up as a test file. `makeProviderRequest` is a local fixture for
// the approved, externally-imported type (not imported from that
// feature's own `testFixtures.ts`, which isn't part of its public
// `index.ts` surface) — it constructs the same shape independently.
import type { ProviderRequest } from '@/features/provider-translation-engine'
import type { Clock, IdGenerator } from './contracts'
import type {
  PipelineConfigurationFacts,
  ProviderExecutionContext,
  ProviderExecutionInstruction,
  ProviderExecutionMessage,
  ProviderExecutionMetadata,
  ProviderExecutionOptions,
  ProviderExecutionRequest,
} from './types'
import type { PipelineInputs } from './pipeline'
import type { PipelineOrchestrationInputs } from './integration'

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

export function makeProviderRequest(overrides: Partial<ProviderRequest> = {}): ProviderRequest {
  return {
    id: 'request-1',
    version: 1,
    providerId: 'openai',
    context: { learnerId: 'learner-1', profileId: 'profile-1', facts: ['active', 'journey-a'] },
    messages: [
      { role: 'system', content: 'response-1, response-composer' },
      { role: 'user', content: 'active, assessment-0-0' },
    ],
    instructions: [{ id: 'system-baseline', directive: 'maintain-mentor-persona' }],
    metadata: { learnerId: 'learner-1', profileId: 'profile-1', source: 'provider-translation-engine', generatedAt: '2026-01-01T00:00:00.000Z' },
    ...overrides,
  }
}

export function makeProviderExecutionMetadata(overrides: Partial<ProviderExecutionMetadata> = {}): ProviderExecutionMetadata {
  return { learnerId: 'learner-1', profileId: 'profile-1', source: 'test', generatedAt: '2026-01-01T00:00:00.000Z', ...overrides }
}

export function makeProviderExecutionOptions(overrides: Partial<ProviderExecutionOptions> = {}): ProviderExecutionOptions {
  return { temperature: 0.7, maxOutputTokens: 1024, ...overrides }
}

export function makeProviderExecutionContext(overrides: Partial<ProviderExecutionContext> = {}): ProviderExecutionContext {
  return { learnerId: 'learner-1', profileId: 'profile-1', facts: ['active'], ...overrides }
}

export function makeProviderExecutionMessage(overrides: Partial<ProviderExecutionMessage> = {}): ProviderExecutionMessage {
  return { role: 'user', content: 'value', ...overrides }
}

export function makeProviderExecutionInstruction(overrides: Partial<ProviderExecutionInstruction> = {}): ProviderExecutionInstruction {
  return { id: 'system-baseline', directive: 'maintain-mentor-persona', ...overrides }
}

export function makeProviderExecutionRequest(overrides: Partial<ProviderExecutionRequest> = {}): ProviderExecutionRequest {
  return {
    id: 'exec-request-1',
    version: 1,
    providerId: 'openai',
    modelId: 'gpt-4o-mini',
    context: makeProviderExecutionContext(),
    options: makeProviderExecutionOptions(),
    messages: [makeProviderExecutionMessage()],
    instructions: [makeProviderExecutionInstruction(), { id: 'safety-baseline', directive: 'enforce-standard-safety-level' }],
    metadata: makeProviderExecutionMetadata(),
    ...overrides,
  }
}

export function makePipelineConfigurationFacts(overrides: PipelineConfigurationFacts = {}): PipelineConfigurationFacts {
  return { ...overrides }
}

export function makePipelineInputs(overrides: Partial<PipelineInputs> = {}): PipelineInputs {
  return {
    learnerId: 'learner-1',
    profileId: 'profile-1',
    providerId: 'openai',
    sourceVersion: 1,
    facts: ['active'],
    messages: [makeProviderExecutionMessage()],
    instructions: [makeProviderExecutionInstruction()],
    ...overrides,
  }
}

export function makePipelineOrchestrationInputs(overrides: Partial<PipelineOrchestrationInputs> = {}): PipelineOrchestrationInputs {
  return {
    learnerId: 'learner-1',
    profileId: 'profile-1',
    providerRequest: makeProviderRequest(),
    configurationFacts: {},
    ...overrides,
  }
}
