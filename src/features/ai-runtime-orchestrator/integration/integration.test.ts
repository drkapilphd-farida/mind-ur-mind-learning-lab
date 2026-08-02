import { describe, expect, it } from 'vitest'
import { makeRuntimeOrchestrationInputs } from '../testFixtures'

describe('RuntimeOrchestrationInputs (fixtures)', () => {
  it('builds a valid, fully-populated inputs object', () => {
    const inputs = makeRuntimeOrchestrationInputs()

    expect(inputs.learnerId).toBe('learner-1')
    expect(inputs.profileId).toBe('profile-1')
    expect(inputs.profile.id).toBe('profile-1')
    expect(inputs.executionPlan.sequences.length).toBeGreaterThan(0)
    expect(inputs.recommendationSet.groups.length).toBeGreaterThan(0)
    expect(inputs.userPrompt).toBe('Help me understand fractions.')
  })

  it('allows a null memoryContext', () => {
    const inputs = makeRuntimeOrchestrationInputs({ memoryContext: null })
    expect(inputs.memoryContext).toBeNull()
  })
})
