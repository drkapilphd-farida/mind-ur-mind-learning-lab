// Shared test-only fixtures for this feature's own test suite — same
// convention as `@/features/ai-mentor-personalization-bridge/testFixtures.ts`.
// Not itself a *.test.ts file, so vitest's `include` glob never picks
// it up as a test file. `makeMentorPersonalizationContext`/
// `makePersonalizationExecutionPlan` are local fixtures for the
// approved, externally-imported types (not imported from those
// features' own `testFixtures.ts`, which isn't part of their public
// `index.ts` surface) — they construct the same shapes independently.
import type { MentorPersonalizationContext } from '@/features/ai-mentor-personalization-bridge'
import type { PersonalizationExecutionPlan } from '@/features/personalization-engine'
import type { Clock, IdGenerator } from './contracts'
import type {
  MentorAction,
  MentorConfigurationFacts,
  MentorResponse,
  MentorResponseCard,
  MentorResponseMetadata,
  MentorResponseSection,
} from './types'
import type { ResponseComposerInputs, ResponseComposerRecommendationItem } from './composition'
import type { MentorResponseOrchestrationInputs } from './integration'

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

export function makeMentorPersonalizationContext(overrides: Partial<MentorPersonalizationContext> = {}): MentorPersonalizationContext {
  return {
    currentJourney: 'journey-a',
    recommendations: { items: [{ category: 'exercise', referenceId: 'ex-1', priority: 'high' }] },
    learningState: { profileLifecycle: 'active', difficultyLevel: 'advanced', appliedAdaptationCount: 2 },
    memoryReferences: [{ memoryId: 'assessment-0-0', summary: 'test' }],
    ...overrides,
  }
}

export function makePersonalizationExecutionPlan(overrides: Partial<PersonalizationExecutionPlan> = {}): PersonalizationExecutionPlan {
  return {
    id: 'plan-1',
    version: 1,
    sequences: [
      { type: 'review', steps: [{ id: 'r1', sequenceType: 'review', referenceId: 'daily', order: 0, priority: 'normal', detail: 'x' }] },
      { type: 'session', steps: [{ id: 's1', sequenceType: 'session', referenceId: '20', order: 0, priority: 'normal', detail: 'x' }] },
    ],
    metadata: { learnerId: 'learner-1', profileId: 'profile-1', source: 'test', generatedAt: '2026-01-01T00:00:00.000Z' },
    ...overrides,
  }
}

export function makeMentorResponseMetadata(overrides: Partial<MentorResponseMetadata> = {}): MentorResponseMetadata {
  return { learnerId: 'learner-1', profileId: 'profile-1', source: 'test', generatedAt: '2026-01-01T00:00:00.000Z', ...overrides }
}

export function makeMentorAction(overrides: Partial<MentorAction> = {}): MentorAction {
  return { id: 'action-ex-1', label: 'review-exercise', referenceId: 'ex-1', ...overrides }
}

export function makeMentorResponseCard(overrides: Partial<MentorResponseCard> = {}): MentorResponseCard {
  return { id: 'card-1', title: 'Card', values: ['value-1'], ...overrides }
}

export function makeMentorResponseSection(overrides: Partial<MentorResponseSection> = {}): MentorResponseSection {
  return { type: 'greeting-context', cards: [makeMentorResponseCard()], actions: [], ...overrides }
}

export function makeMentorResponse(overrides: Partial<MentorResponse> = {}): MentorResponse {
  return {
    id: 'response-1',
    version: 1,
    sections: [
      { type: 'greeting-context', cards: [{ id: 'greeting-lifecycle', title: 'Learner Status', values: ['active'] }], actions: [] },
      { type: 'learning-summary', cards: [{ id: 'learning-summary', title: 'Learning Summary', values: ['journey-a', 'advanced'] }], actions: [] },
      {
        type: 'active-recommendation-summary',
        cards: [{ id: 'recommendation-summary', title: 'Active Recommendations', values: ['exercise:ex-1'] }],
        actions: [],
      },
      { type: 'next-action', cards: [], actions: [{ id: 'action-ex-1', label: 'review-exercise', referenceId: 'ex-1' }] },
      { type: 'progress-summary', cards: [{ id: 'progress-summary', title: 'Progress Summary', values: ['daily', '20'] }], actions: [] },
      { type: 'motivation-metadata', cards: [{ id: 'motivation-metadata', title: 'Motivation Metadata', values: ['2'] }], actions: [] },
    ],
    metadata: makeMentorResponseMetadata(),
    ...overrides,
  }
}

export function makeMentorConfigurationFacts(overrides: MentorConfigurationFacts = {}): MentorConfigurationFacts {
  return { ...overrides }
}

export function makeResponseComposerRecommendationItem(overrides: Partial<ResponseComposerRecommendationItem> = {}): ResponseComposerRecommendationItem {
  return { category: 'exercise', referenceId: 'ex-1', priority: 'high', ...overrides }
}

export function makeResponseComposerInputs(overrides: Partial<ResponseComposerInputs> = {}): ResponseComposerInputs {
  return {
    learnerId: 'learner-1',
    profileId: 'profile-1',
    currentJourney: 'journey-a',
    difficultyLevel: 'advanced',
    profileLifecycle: 'active',
    appliedAdaptationCount: 2,
    recommendationItems: [makeResponseComposerRecommendationItem()],
    reviewReferenceIds: ['daily'],
    sessionReferenceIds: ['20'],
    ...overrides,
  }
}

export function makeMentorResponseOrchestrationInputs(overrides: Partial<MentorResponseOrchestrationInputs> = {}): MentorResponseOrchestrationInputs {
  return {
    learnerId: 'learner-1',
    profileId: 'profile-1',
    mentorContext: makeMentorPersonalizationContext(),
    executionPlan: makePersonalizationExecutionPlan(),
    configurationFacts: {},
    ...overrides,
  }
}
