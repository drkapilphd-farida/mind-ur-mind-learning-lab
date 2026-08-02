// Shared test-only fixtures for this feature's own test suite — same
// convention as `@/features/ai-mentor-prompt-assembler/testFixtures.ts`.
// Not itself a *.test.ts file, so vitest's `include` glob never picks
// it up as a test file. `makeMentorPromptPayload` is a local fixture
// for the approved, externally-imported type (not imported from that
// feature's own `testFixtures.ts`, which isn't part of its public
// `index.ts` surface) — it constructs the same shape independently.
import type { MentorPromptPayload } from '@/features/ai-mentor-prompt-assembler'
import type { Clock, IdGenerator } from './contracts'
import type {
  ProviderContext,
  ProviderInstruction,
  ProviderMessage,
  ProviderProfileId,
  ProviderRequest,
  ProviderRequestMetadata,
  TranslationConfigurationFacts,
} from './types'
import type { TranslationInputs } from './translation'
import type { TranslationOrchestrationInputs } from './integration'

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

export function makeMentorPromptPayload(overrides: Partial<MentorPromptPayload> = {}): MentorPromptPayload {
  return {
    id: 'payload-1',
    version: 1,
    context: { learnerId: 'learner-1', profileId: 'profile-1', profileLifecycle: 'active', currentJourney: 'journey-a', difficultyLevel: 'advanced' },
    sections: [
      { type: 'system-context', values: ['response-1', 'response-composer'] },
      { type: 'learner-context', values: ['active', 'assessment-0-0'] },
      { type: 'current-journey', values: ['journey-a', 'advanced'] },
      { type: 'recommendations', values: ['exercise:ex-1'] },
      { type: 'next-actions', values: ['review-exercise:ex-1'] },
      { type: 'metadata', values: ['2'] },
    ],
    instructions: [
      { id: 'system-baseline', directive: 'maintain-mentor-persona' },
      { id: 'personalization-baseline', directive: 'use-personalization-context' },
    ],
    metadata: { learnerId: 'learner-1', profileId: 'profile-1', source: 'prompt-assembler', generatedAt: '2026-01-01T00:00:00.000Z' },
    ...overrides,
  }
}

export function makeProviderRequestMetadata(overrides: Partial<ProviderRequestMetadata> = {}): ProviderRequestMetadata {
  return { learnerId: 'learner-1', profileId: 'profile-1', source: 'test', generatedAt: '2026-01-01T00:00:00.000Z', ...overrides }
}

export function makeProviderMessage(overrides: Partial<ProviderMessage> = {}): ProviderMessage {
  return { role: 'user', content: 'value', ...overrides }
}

export function makeProviderInstruction(overrides: Partial<ProviderInstruction> = {}): ProviderInstruction {
  return { id: 'system-baseline', directive: 'maintain-mentor-persona', ...overrides }
}

export function makeProviderContext(overrides: Partial<ProviderContext> = {}): ProviderContext {
  return { learnerId: 'learner-1', profileId: 'profile-1', facts: ['active', 'journey-a'], ...overrides }
}

export function makeProviderRequest(overrides: Partial<ProviderRequest> = {}): ProviderRequest {
  return {
    id: 'request-1',
    version: 1,
    providerId: 'openai',
    context: makeProviderContext(),
    messages: [
      { role: 'system', content: 'response-1, response-composer' },
      { role: 'user', content: 'active, assessment-0-0' },
      { role: 'user', content: 'journey-a, advanced' },
      { role: 'user', content: 'exercise:ex-1' },
      { role: 'user', content: 'review-exercise:ex-1' },
      { role: 'user', content: '2' },
    ],
    instructions: [makeProviderInstruction()],
    metadata: makeProviderRequestMetadata(),
    ...overrides,
  }
}

export function makeTranslationConfigurationFacts(overrides: TranslationConfigurationFacts = {}): TranslationConfigurationFacts {
  return { ...overrides }
}

export function makeTranslationInputs(overrides: Partial<TranslationInputs> = {}): TranslationInputs {
  return {
    learnerId: 'learner-1',
    profileId: 'profile-1',
    systemContextValues: ['response-1', 'response-composer'],
    learnerContextValues: ['active', 'assessment-0-0'],
    currentJourneyValues: ['journey-a', 'advanced'],
    recommendationValues: ['exercise:ex-1'],
    nextActionValues: ['review-exercise:ex-1'],
    metadataValues: ['2'],
    instructions: [makeProviderInstruction()],
    ...overrides,
  }
}

export function makeTranslationOrchestrationInputs(overrides: Partial<TranslationOrchestrationInputs> = {}): TranslationOrchestrationInputs {
  return {
    learnerId: 'learner-1',
    profileId: 'profile-1',
    promptPayload: makeMentorPromptPayload(),
    providerId: 'openai' as ProviderProfileId,
    configurationFacts: {},
    ...overrides,
  }
}
