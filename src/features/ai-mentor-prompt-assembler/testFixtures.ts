// Shared test-only fixtures for this feature's own test suite — same
// convention as `@/features/ai-mentor-response-composer/testFixtures.ts`.
// Not itself a *.test.ts file, so vitest's `include` glob never picks
// it up as a test file. `makeMentorResponse`/`makeMentorPersonalizationContext`
// are local fixtures for the approved, externally-imported types (not
// imported from those features' own `testFixtures.ts`, which isn't
// part of their public `index.ts` surface) — they construct the same
// shapes independently.
import type { MentorResponse } from '@/features/ai-mentor-response-composer'
import type { MentorPersonalizationContext } from '@/features/ai-mentor-personalization-bridge'
import type { Clock, IdGenerator } from './contracts'
import type {
  MentorConfigurationFacts,
  MentorPromptContext,
  MentorPromptInstruction,
  MentorPromptMetadata,
  MentorPromptPayload,
  MentorPromptSection,
} from './types'
import type { PromptAssemblyInputs } from './assembly'
import type { MentorPromptOrchestrationInputs } from './integration'

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

export function makeMentorResponse(overrides: Partial<MentorResponse> = {}): MentorResponse {
  return {
    id: 'response-1',
    version: 1,
    sections: [{ type: 'next-action', cards: [], actions: [{ id: 'action-ex-1', label: 'review-exercise', referenceId: 'ex-1' }] }],
    metadata: { learnerId: 'learner-1', profileId: 'profile-1', source: 'response-composer', generatedAt: '2026-01-01T00:00:00.000Z' },
    ...overrides,
  }
}

export function makeMentorPersonalizationContext(overrides: Partial<MentorPersonalizationContext> = {}): MentorPersonalizationContext {
  return {
    currentJourney: 'journey-a',
    recommendations: { items: [{ category: 'exercise', referenceId: 'ex-1', priority: 'high' }] },
    learningState: { profileLifecycle: 'active', difficultyLevel: 'advanced', appliedAdaptationCount: 2 },
    memoryReferences: [{ memoryId: 'assessment-0-0', summary: 'test' }],
    ...overrides,
  }
}

export function makeMentorPromptMetadata(overrides: Partial<MentorPromptMetadata> = {}): MentorPromptMetadata {
  return { learnerId: 'learner-1', profileId: 'profile-1', source: 'test', generatedAt: '2026-01-01T00:00:00.000Z', ...overrides }
}

export function makeMentorPromptContext(overrides: Partial<MentorPromptContext> = {}): MentorPromptContext {
  return { learnerId: 'learner-1', profileId: 'profile-1', profileLifecycle: 'active', currentJourney: 'journey-a', difficultyLevel: 'advanced', ...overrides }
}

export function makeMentorPromptSection(overrides: Partial<MentorPromptSection> = {}): MentorPromptSection {
  return { type: 'system-context', values: ['value-1'], ...overrides }
}

export function makeMentorPromptInstruction(overrides: Partial<MentorPromptInstruction> = {}): MentorPromptInstruction {
  return { id: 'system-baseline', directive: 'maintain-mentor-persona', ...overrides }
}

export function makeMentorPromptPayload(overrides: Partial<MentorPromptPayload> = {}): MentorPromptPayload {
  return {
    id: 'payload-1',
    version: 1,
    context: makeMentorPromptContext(),
    sections: [
      { type: 'system-context', values: ['response-1', 'response-composer'] },
      { type: 'learner-context', values: ['active', 'assessment-0-0'] },
      { type: 'current-journey', values: ['journey-a', 'advanced'] },
      { type: 'recommendations', values: ['exercise:ex-1'] },
      { type: 'next-actions', values: ['review-exercise:ex-1'] },
      { type: 'metadata', values: ['2'] },
    ],
    instructions: [makeMentorPromptInstruction(), { id: 'personalization-baseline', directive: 'use-personalization-context' }],
    metadata: makeMentorPromptMetadata(),
    ...overrides,
  }
}

export function makeMentorConfigurationFacts(overrides: MentorConfigurationFacts = {}): MentorConfigurationFacts {
  return { ...overrides }
}

export function makePromptAssemblyInputs(overrides: Partial<PromptAssemblyInputs> = {}): PromptAssemblyInputs {
  return {
    learnerId: 'learner-1',
    profileId: 'profile-1',
    sourceResponseId: 'response-1',
    responseSource: 'response-composer',
    profileLifecycle: 'active',
    currentJourney: 'journey-a',
    difficultyLevel: 'advanced',
    recommendationValues: ['exercise:ex-1'],
    nextActionValues: ['review-exercise:ex-1'],
    memoryReferenceIds: ['assessment-0-0'],
    appliedAdaptationCount: 2,
    ...overrides,
  }
}

export function makeMentorPromptOrchestrationInputs(overrides: Partial<MentorPromptOrchestrationInputs> = {}): MentorPromptOrchestrationInputs {
  return {
    learnerId: 'learner-1',
    profileId: 'profile-1',
    mentorResponse: makeMentorResponse(),
    mentorContext: makeMentorPersonalizationContext(),
    configurationFacts: {},
    ...overrides,
  }
}
