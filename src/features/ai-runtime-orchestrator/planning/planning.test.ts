import { describe, expect, it } from 'vitest'
import { buildRuntimeExecutionPlan } from './buildRuntimeExecutionPlan'
import { makeRuntimeOrchestrationInputs } from '../testFixtures'

describe('buildRuntimeExecutionPlan (Runtime initialization)', () => {
  it('builds the fixed, deterministic stage order plus the selection hints from the inputs', () => {
    const inputs = makeRuntimeOrchestrationInputs({ preferredProviderId: 'openai', preferredModelId: 'gpt-4o', requestedCapability: 'vision', minimumContextSize: 50000 })

    const plan = buildRuntimeExecutionPlan(inputs)

    expect(plan.plannedStages).toEqual([
      'pending',
      'personalization-ready',
      'recommendation-ready',
      'mentor-ready',
      'provider-selected',
      'model-selected',
      'request-ready',
      'adapter-processed',
      'response-ready',
      'completed',
    ])
    expect(plan.preferredProviderId).toBe('openai')
    expect(plan.preferredModelId).toBe('gpt-4o')
    expect(plan.requestedCapability).toBe('vision')
    expect(plan.minimumContextSize).toBe(50000)
  })

  it('carries null selection hints through unchanged', () => {
    const inputs = makeRuntimeOrchestrationInputs({ preferredProviderId: null, preferredModelId: null, requestedCapability: null, minimumContextSize: null })

    const plan = buildRuntimeExecutionPlan(inputs)

    expect(plan.preferredProviderId).toBeNull()
    expect(plan.preferredModelId).toBeNull()
    expect(plan.requestedCapability).toBeNull()
    expect(plan.minimumContextSize).toBeNull()
  })
})
