import { describe, expect, it } from 'vitest'
import { buildMentorRecommendationSet } from './buildMentorRecommendationSet'
import { buildCurrentJourney } from './buildCurrentJourney'
import { buildMentorLearningState } from './buildMentorLearningState'
import { buildMentorMemoryReferences } from './buildMentorMemoryReferences'
import { buildMentorContextAssemblyInputs } from './buildMentorContextAssemblyInputs'
import {
  makeMemoryContext,
  makePersonalizationAdaptation,
  makePersonalizationExecutionPlan,
  makePersonalizationProfile,
  makePersonalizationRecommendationSet,
} from '../testFixtures'

describe('buildMentorRecommendationSet', () => {
  it('returns an empty set for a null recommendation set', () => {
    expect(buildMentorRecommendationSet(null)).toEqual({ items: [] })
  })

  it('flattens every group into a flat items list', () => {
    const recommendationSet = makePersonalizationRecommendationSet({
      groups: [
        { category: 'journey', items: [{ id: 'r1', category: 'journey', referenceId: 'journey-a', priority: 'high', rationale: 'x' }] },
        { category: 'exercise', items: [{ id: 'r2', category: 'exercise', referenceId: 'ex-1', priority: 'normal', rationale: 'y' }] },
      ],
    })
    expect(buildMentorRecommendationSet(recommendationSet)).toEqual({
      items: [
        { category: 'journey', referenceId: 'journey-a', priority: 'high' },
        { category: 'exercise', referenceId: 'ex-1', priority: 'normal' },
      ],
    })
  })
})

describe('buildCurrentJourney', () => {
  it('returns null for a null execution plan', () => {
    expect(buildCurrentJourney(null)).toBeNull()
  })

  it('returns null when there is no journey sequence', () => {
    expect(buildCurrentJourney(makePersonalizationExecutionPlan({ sequences: [] }))).toBeNull()
  })

  it('returns the journey sequence first step referenceId', () => {
    const executionPlan = makePersonalizationExecutionPlan({
      sequences: [{ type: 'journey', steps: [{ id: 'j1', sequenceType: 'journey', referenceId: 'journey-a', order: 0, priority: 'high', detail: 'x' }] }],
    })
    expect(buildCurrentJourney(executionPlan)).toBe('journey-a')
  })
})

describe('buildMentorLearningState', () => {
  it('falls back to defaults for all-null inputs', () => {
    expect(buildMentorLearningState(null, null, null)).toEqual({ profileLifecycle: 'unknown', difficultyLevel: null, appliedAdaptationCount: 0 })
  })

  it('derives lifecycle, difficulty, and applied count from the given sources', () => {
    const profile = makePersonalizationProfile({ lifecycle: 'active' })
    const executionPlan = makePersonalizationExecutionPlan({
      sequences: [{ type: 'difficulty', steps: [{ id: 'd1', sequenceType: 'difficulty', referenceId: 'advanced', order: 0, priority: 'high', detail: 'x' }] }],
    })
    const adaptation = makePersonalizationAdaptation({
      results: [
        { ruleId: 'a', type: 'difficulty', value: 'increase-difficulty', applied: true, priority: 'high', reason: 'x' },
        { ruleId: 'b', type: 'review-frequency', value: 'no-change', applied: false, priority: 'low', reason: 'y' },
      ],
    })

    expect(buildMentorLearningState(profile, executionPlan, adaptation)).toEqual({ profileLifecycle: 'active', difficultyLevel: 'advanced', appliedAdaptationCount: 1 })
  })
})

describe('buildMentorMemoryReferences', () => {
  it('returns an empty array for a null memory context', () => {
    expect(buildMentorMemoryReferences(null)).toEqual([])
  })

  it('produces one reference per section summary with a deterministic synthetic id', () => {
    const memoryContext = makeMemoryContext({ sections: [{ category: 'assessment', summaries: ['first', 'second'] }] })
    expect(buildMentorMemoryReferences(memoryContext)).toEqual([
      { memoryId: 'assessment-0-0', summary: 'first' },
      { memoryId: 'assessment-0-1', summary: 'second' },
    ])
  })
})

describe('buildMentorContextAssemblyInputs', () => {
  it('composes reduced assembly inputs and accurate presence flags from full raw inputs', () => {
    const { assemblyInputs, presence } = buildMentorContextAssemblyInputs({
      learnerId: 'learner-1',
      profileId: 'profile-1',
      profile: makePersonalizationProfile(),
      executionPlan: makePersonalizationExecutionPlan(),
      recommendationSet: makePersonalizationRecommendationSet(),
      adaptation: makePersonalizationAdaptation(),
      memoryContext: makeMemoryContext(),
      configurationFacts: {},
    })

    expect(assemblyInputs.learnerId).toBe('learner-1')
    expect(presence).toEqual({ hasPersonalization: true, hasExecutionPlan: true, hasRecommendations: true })
  })

  it('reports false presence flags for all-null raw inputs', () => {
    const { presence } = buildMentorContextAssemblyInputs({
      learnerId: 'learner-1',
      profileId: 'profile-1',
      profile: null,
      executionPlan: null,
      recommendationSet: null,
      adaptation: null,
      memoryContext: null,
      configurationFacts: {},
    })

    expect(presence).toEqual({ hasPersonalization: false, hasExecutionPlan: false, hasRecommendations: false })
  })
})
