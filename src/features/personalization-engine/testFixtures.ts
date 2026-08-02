// Shared test-only fixtures for this feature's own test suite — same
// convention as `@/features/memory-persistence/testFixtures.ts`. Not
// itself a *.test.ts file, so vitest's `include` glob never picks it
// up as a test file. `makeContextPackage`/`makeSessionContext`/
// `makeMemoryConfiguration` are local fixtures for the three approved,
// externally-imported types (not imported from those features' own
// testFixtures.ts, which isn't part of their public `index.ts`
// surface) — they construct the same shapes independently.
import type { ContextPackage } from '@/features/memory-context-assembly'
import type { SessionContext } from '@/features/memory-session-context'
import type { MemoryConfiguration } from '@/features/memory-configuration-policy'
import type { AdaptiveLearningPlan } from '@/features/adaptive-learning-planner'
import type { Clock, IdGenerator } from './contracts'
import type { PersonalizationContext, PersonalizationDecision, PersonalizationMetadata, PersonalizationProfile, PersonalizationRule } from './domain'
import type { PersonalizationStrategy, StrategyResult } from './strategyDomain'
import type { AdaptivePlanExecutionFacts, ExecutionMetadata, ExecutionSequence, ExecutionStep, PersonalizationExecutionPlan } from './executionDomain'
import type { ExecutionPlannerInputs } from './executionPlanning'
import type { PersonalizationRecommendationSet, RecommendationGroup, RecommendationItem, RecommendationMetadata } from './recommendationDomain'
import type { RecommendationBuilderInputs } from './recommendationBuilder'
import type { AdaptationMetadata, AdaptationResult, PersonalizationAdaptation } from './adaptationDomain'
import type { AdaptationEvaluatorInputs } from './adaptationEvaluation'

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

export function makePersonalizationMetadata(overrides: Partial<PersonalizationMetadata> = {}): PersonalizationMetadata {
  return { learnerId: 'learner-1', source: 'test', tags: [], ...overrides }
}

export function makePersonalizationRule(overrides: Partial<PersonalizationRule> = {}): PersonalizationRule {
  return {
    id: 'rule-1',
    name: 'Test Rule',
    condition: { inputType: 'assessment-results', factKey: 'accuracy', operator: 'greater-than', value: 0.8 },
    outcome: { decisionType: 'difficulty', value: 'advanced' },
    ...overrides,
  }
}

export function makePersonalizationProfile(overrides: Partial<PersonalizationProfile> = {}): PersonalizationProfile {
  return {
    id: 'profile-1',
    lifecycle: 'active',
    rules: [],
    metadata: makePersonalizationMetadata(),
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export function makePersonalizationContext(overrides: Partial<PersonalizationContext> = {}): PersonalizationContext {
  return {
    assessmentResults: {},
    learningProgress: {},
    memoryContext: {},
    sessionContext: {},
    configuration: {},
    ...overrides,
  }
}

export function makeContextPackage(overrides: Partial<ContextPackage> = {}): ContextPackage {
  return {
    id: 'package-1',
    sections: [
      {
        id: 'section-high',
        priority: 'high',
        references: [{ memoryId: 'memory-1', priority: 'high', reason: 'importance=high' }],
      },
    ],
    metadata: { sessionId: null, generatedAt: '2026-01-01T00:00:00.000Z', version: 1 },
    ...overrides,
  }
}

export function makeSessionContext(overrides: Partial<SessionContext> = {}): SessionContext {
  return {
    id: 'session-1',
    lifecycle: 'active',
    entries: [],
    metadata: { ownerId: 'learner-1', source: 'test', tags: [] },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export function makeMemoryConfiguration(overrides: Partial<MemoryConfiguration> = {}): MemoryConfiguration {
  return {
    id: 'configuration-1',
    entries: [],
    metadata: { profileId: null, version: 1, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
    ...overrides,
  }
}

// Sprint 24 — Strategy Engine™ fixtures. Additive only, nothing above
// this line changed.
export function makePersonalizationDecision(overrides: Partial<PersonalizationDecision> = {}): PersonalizationDecision {
  return { id: 'decision-1', profileId: 'profile-1', recommendations: [], generatedAt: '2026-01-01T00:00:00.000Z', ...overrides }
}

export function makePersonalizationStrategy(overrides: Partial<PersonalizationStrategy> = {}): PersonalizationStrategy {
  return {
    id: 'strategy-1',
    type: 'difficulty',
    priority: 1,
    dependsOnStrategyIds: [],
    condition: null,
    outcomeValue: 'advanced',
    metadata: { source: 'test', tags: [] },
    ...overrides,
  }
}

export function makeStrategyResult(overrides: Partial<StrategyResult> = {}): StrategyResult {
  return { strategyId: 'strategy-1', type: 'difficulty', value: 'advanced', reason: 'test', ...overrides }
}

// Sprint 25 — Execution Engine™ fixtures. Additive only, nothing above
// this line changed.
export function makeAdaptiveLearningPlan(overrides: Partial<AdaptiveLearningPlan> = {}): AdaptiveLearningPlan {
  return {
    recommendedJourney: 'default-journey',
    recommendedExercises: [],
    dailyDurationMinutes: 20,
    weeklySchedule: { days: [], totalMinutesPerWeek: 0 },
    prioritySkills: [],
    difficultyLevel: 'intermediate',
    learningMilestones: [],
    suggestedMentorFocus: 'general',
    ...overrides,
  }
}

export function makeAdaptivePlanExecutionFacts(overrides: Partial<AdaptivePlanExecutionFacts> = {}): AdaptivePlanExecutionFacts {
  return {
    journey: 'default-journey',
    exerciseIds: ['exercise-1'],
    difficultyLevel: 'intermediate',
    sessionDurationMinutes: null,
    milestoneIds: [],
    ...overrides,
  }
}

export function makeExecutionStep(overrides: Partial<ExecutionStep> = {}): ExecutionStep {
  return { id: 'step-1', sequenceType: 'exercise', referenceId: 'ref-1', order: 0, priority: 'normal', detail: 'test', ...overrides }
}

export function makeExecutionSequence(overrides: Partial<ExecutionSequence> = {}): ExecutionSequence {
  return { type: 'exercise', steps: [makeExecutionStep()], ...overrides }
}

export function makeExecutionMetadata(overrides: Partial<ExecutionMetadata> = {}): ExecutionMetadata {
  return { learnerId: 'learner-1', profileId: 'profile-1', source: 'test', generatedAt: '2026-01-01T00:00:00.000Z', ...overrides }
}

export function makePersonalizationExecutionPlan(overrides: Partial<PersonalizationExecutionPlan> = {}): PersonalizationExecutionPlan {
  return { id: 'plan-1', version: 1, sequences: [makeExecutionSequence()], metadata: makeExecutionMetadata(), ...overrides }
}

export function makeExecutionPlannerInputs(overrides: Partial<ExecutionPlannerInputs> = {}): ExecutionPlannerInputs {
  return {
    profileId: 'profile-1',
    learnerId: 'learner-1',
    decisions: [],
    strategyResults: [],
    adaptivePlanFacts: makeAdaptivePlanExecutionFacts(),
    memoryFacts: {},
    configurationFacts: {},
    ...overrides,
  }
}

// Sprint 26 — Recommendation Engine™ fixtures. Additive only, nothing
// above this line changed.
export function makeRecommendationItem(overrides: Partial<RecommendationItem> = {}): RecommendationItem {
  return { id: 'recommendation-1', category: 'exercise', referenceId: 'ref-1', priority: 'normal', rationale: 'test', ...overrides }
}

export function makeRecommendationGroup(overrides: Partial<RecommendationGroup> = {}): RecommendationGroup {
  return { category: 'exercise', items: [makeRecommendationItem()], ...overrides }
}

export function makeRecommendationMetadata(overrides: Partial<RecommendationMetadata> = {}): RecommendationMetadata {
  return { learnerId: 'learner-1', profileId: 'profile-1', source: 'test', generatedAt: '2026-01-01T00:00:00.000Z', ...overrides }
}

export function makePersonalizationRecommendationSet(overrides: Partial<PersonalizationRecommendationSet> = {}): PersonalizationRecommendationSet {
  return { id: 'set-1', version: 1, groups: [makeRecommendationGroup()], metadata: makeRecommendationMetadata(), ...overrides }
}

export function makeRecommendationBuilderInputs(overrides: Partial<RecommendationBuilderInputs> = {}): RecommendationBuilderInputs {
  return {
    profileId: 'profile-1',
    learnerId: 'learner-1',
    executionPlan: makePersonalizationExecutionPlan(),
    decisions: [],
    strategyResults: [],
    memoryFacts: {},
    configurationFacts: {},
    ...overrides,
  }
}

// Sprint 27 — Adaptation Engine™ fixtures. Additive only, nothing above
// this line changed.
export function makeAdaptationResult(overrides: Partial<AdaptationResult> = {}): AdaptationResult {
  return { ruleId: 'difficulty-adjustment', type: 'difficulty', value: 'no-change', applied: false, priority: 'low', reason: 'test', ...overrides }
}

export function makeAdaptationMetadata(overrides: Partial<AdaptationMetadata> = {}): AdaptationMetadata {
  return { learnerId: 'learner-1', profileId: 'profile-1', source: 'test', generatedAt: '2026-01-01T00:00:00.000Z', ...overrides }
}

export function makePersonalizationAdaptation(overrides: Partial<PersonalizationAdaptation> = {}): PersonalizationAdaptation {
  return { id: 'adaptation-1', version: 1, profileId: 'profile-1', results: [makeAdaptationResult()], metadata: makeAdaptationMetadata(), ...overrides }
}

export function makeAdaptationEvaluatorInputs(overrides: Partial<AdaptationEvaluatorInputs> = {}): AdaptationEvaluatorInputs {
  return {
    learnerId: 'learner-1',
    profile: makePersonalizationProfile(),
    recommendationSet: makePersonalizationRecommendationSet(),
    assessmentResults: {},
    learningProgress: {},
    memoryFacts: {},
    configurationFacts: {},
    ...overrides,
  }
}
