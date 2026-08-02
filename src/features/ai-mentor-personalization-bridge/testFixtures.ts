// Shared test-only fixtures for this feature's own test suite — same
// convention as `@/features/personalization-engine/testFixtures.ts`.
// Not itself a *.test.ts file, so vitest's `include` glob never picks
// it up as a test file. `makePersonalizationProfile`/
// `makePersonalizationExecutionPlan`/`makePersonalizationRecommendationSet`/
// `makePersonalizationAdaptation`/`makeMemoryContext` are local
// fixtures for the approved, externally-imported types (not imported
// from those features' own `testFixtures.ts`, which isn't part of
// their public `index.ts` surface) — they construct the same shapes
// independently.
import type { PersonalizationAdaptation, PersonalizationExecutionPlan, PersonalizationProfile, PersonalizationRecommendationSet } from '@/features/personalization-engine'
import type { MemoryContext } from '@/features/ai-memory-engine'
import type { Clock, IdGenerator } from './contracts'
import type {
  MentorConfigurationFacts,
  MentorContextMetadata,
  MentorLearningState,
  MentorMemoryReference,
  MentorPersonalizationContext,
  MentorPersonalizationContextSnapshot,
  MentorRecommendationSet,
} from './types'
import type { MentorContextAssemblyInputs } from './contextAssembly'
import type { MentorContextOrchestrationInputs } from './integration'

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
    ],
    metadata: { learnerId: 'learner-1', profileId: 'profile-1', source: 'test', generatedAt: '2026-01-01T00:00:00.000Z' },
    ...overrides,
  }
}

export function makePersonalizationRecommendationSet(overrides: Partial<PersonalizationRecommendationSet> = {}): PersonalizationRecommendationSet {
  return {
    id: 'set-1',
    version: 1,
    groups: [
      { category: 'exercise', items: [{ id: 'r1', category: 'exercise', referenceId: 'ex-1', priority: 'normal', rationale: 'test' }] },
    ],
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
    sections: [{ category: 'journey', summaries: ['A short memory summary.'] }],
    generatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export function makeMentorContextMetadata(overrides: Partial<MentorContextMetadata> = {}): MentorContextMetadata {
  return { learnerId: 'learner-1', profileId: 'profile-1', source: 'test', generatedAt: '2026-01-01T00:00:00.000Z', ...overrides }
}

export function makeMentorRecommendationSet(overrides: Partial<MentorRecommendationSet> = {}): MentorRecommendationSet {
  return { items: [{ category: 'exercise', referenceId: 'ex-1', priority: 'normal' }], ...overrides }
}

export function makeMentorLearningState(overrides: Partial<MentorLearningState> = {}): MentorLearningState {
  return { profileLifecycle: 'active', difficultyLevel: null, appliedAdaptationCount: 0, ...overrides }
}

export function makeMentorMemoryReference(overrides: Partial<MentorMemoryReference> = {}): MentorMemoryReference {
  return { memoryId: 'reading-0-0', summary: 'test', ...overrides }
}

export function makeMentorPersonalizationContext(overrides: Partial<MentorPersonalizationContext> = {}): MentorPersonalizationContext {
  return {
    currentJourney: 'journey-a',
    recommendations: makeMentorRecommendationSet(),
    learningState: makeMentorLearningState(),
    memoryReferences: [makeMentorMemoryReference()],
    ...overrides,
  }
}

export function makeMentorPersonalizationContextSnapshot(overrides: Partial<MentorPersonalizationContextSnapshot> = {}): MentorPersonalizationContextSnapshot {
  return { id: 'snapshot-1', version: 1, context: makeMentorPersonalizationContext(), metadata: makeMentorContextMetadata(), ...overrides }
}

export function makeMentorContextAssemblyInputs(overrides: Partial<MentorContextAssemblyInputs> = {}): MentorContextAssemblyInputs {
  return {
    learnerId: 'learner-1',
    profileId: 'profile-1',
    currentJourney: 'journey-a',
    recommendations: makeMentorRecommendationSet(),
    learningState: makeMentorLearningState(),
    memoryReferences: [makeMentorMemoryReference()],
    ...overrides,
  }
}

export function makeMentorConfigurationFacts(overrides: MentorConfigurationFacts = {}): MentorConfigurationFacts {
  return { ...overrides }
}

export function makeMentorContextOrchestrationInputs(overrides: Partial<MentorContextOrchestrationInputs> = {}): MentorContextOrchestrationInputs {
  return {
    learnerId: 'learner-1',
    profileId: 'profile-1',
    profile: makePersonalizationProfile(),
    executionPlan: makePersonalizationExecutionPlan(),
    recommendationSet: makePersonalizationRecommendationSet(),
    adaptation: makePersonalizationAdaptation(),
    memoryContext: makeMemoryContext(),
    configurationFacts: {},
    ...overrides,
  }
}
