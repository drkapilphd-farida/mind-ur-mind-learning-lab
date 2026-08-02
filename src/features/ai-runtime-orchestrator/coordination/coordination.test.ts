import { describe, expect, it } from 'vitest'
import type { ProviderSelectionEngine } from '@/features/provider-selection-engine'
import type { ModelSelectionEngine } from '@/features/model-selection-engine'
import type { ProviderAdapterFactory } from '@/features/provider-adapter-layer'
import type { ResponseProcessingPipeline } from '@/features/response-processing-pipeline'
import { createRuntimeCoordinator } from './DefaultRuntimeCoordinator'
import { makeRuntimeOrchestrationInputs } from '../testFixtures'

const noProviderEngine: ProviderSelectionEngine = {
  select: () => ({ selectedProviderId: null, resolutionPath: 'none', reason: 'stub: no provider' }),
}

const noModelEngine: ModelSelectionEngine = {
  select: () => ({ selectedModelId: null, resolutionPath: 'none', reason: 'stub: no model' }),
}

const throwingAdapterFactory: ProviderAdapterFactory = {
  create: () => {
    throw new Error('stub: no adapter')
  },
}

const rejectingResponsePipeline: ResponseProcessingPipeline = {
  process: (raw) => ({
    envelope: { requestId: raw.metadata?.requestId ?? '', providerId: raw.providerId, content: raw.content ?? '', finishReason: 'unknown', usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 }, metadata: { modelUsed: '', requestId: '' }, error: null },
    validationResult: { valid: false, issues: [{ type: 'invalid-response', detail: 'stub rejection' }] },
    diagnostics: { requestId: '', providerId: raw.providerId, validationResult: { valid: false, issues: [] }, finishReason: 'unknown', usagePresent: false, errorPresent: false, contentLength: 0 },
  }),
}

describe('DefaultRuntimeCoordinator', () => {
  it('End-to-End Orchestration / Success Flow: a well-formed run reaches completed with a success result', () => {
    const coordinator = createRuntimeCoordinator()

    const result = coordinator.coordinate(makeRuntimeOrchestrationInputs())

    expect(result.completionStatus).toBe('completed')
    expect(result.state).toBe('completed')
    expect(result.success).not.toBeNull()
    expect(result.success?.responseText).toContain('Help me understand fractions.')
    expect(result.diagnostics.completedStages).toEqual([
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
  })

  it('Deterministic Execution: the same inputs produce the same outcome across two coordinators', () => {
    const coordinatorA = createRuntimeCoordinator()
    const coordinatorB = createRuntimeCoordinator()
    const inputs = makeRuntimeOrchestrationInputs()

    expect(coordinatorA.coordinate(inputs)).toEqual(coordinatorB.coordinate(inputs))
  })

  it('Failure Propagation: missing-provider stops the run at provider selection', () => {
    const coordinator = createRuntimeCoordinator({ providerSelectionEngine: noProviderEngine })

    const result = coordinator.coordinate(makeRuntimeOrchestrationInputs())

    expect(result.completionStatus).toBe('failed')
    expect(result.state).toBe('failed')
    expect(result.diagnostics.validationResult.issues.some((issue) => issue.type === 'missing-provider')).toBe(true)
    expect(result.diagnostics.completedStages).toEqual(['pending', 'personalization-ready', 'recommendation-ready', 'mentor-ready', 'failed'])
  })

  it('Failure Propagation: missing-model stops the run at model selection', () => {
    const coordinator = createRuntimeCoordinator({ modelSelectionEngine: noModelEngine })

    const result = coordinator.coordinate(makeRuntimeOrchestrationInputs())

    expect(result.completionStatus).toBe('failed')
    expect(result.diagnostics.validationResult.issues.some((issue) => issue.type === 'missing-model')).toBe(true)
    expect(result.diagnostics.selectedProviderId).not.toBeNull()
    expect(result.diagnostics.selectedModelId).toBeNull()
  })

  it('Failure Propagation: a blank user prompt fails at the request execution pipeline stage', () => {
    const coordinator = createRuntimeCoordinator()

    const result = coordinator.coordinate(makeRuntimeOrchestrationInputs({ userPrompt: '' }))

    expect(result.completionStatus).toBe('failed')
    expect(result.diagnostics.validationResult.issues.some((issue) => issue.type === 'request-pipeline-failure')).toBe(true)
  })

  it('Failure Propagation: an unrecognized selected provider fails at the mock adapter stage', () => {
    const coordinator = createRuntimeCoordinator({ providerAdapterFactory: throwingAdapterFactory })

    const result = coordinator.coordinate(makeRuntimeOrchestrationInputs())

    expect(result.completionStatus).toBe('failed')
    expect(result.diagnostics.validationResult.issues.some((issue) => issue.type === 'provider-adapter-failure')).toBe(true)
  })

  it('Failure Propagation: a rejecting response processing pipeline fails at the final stage', () => {
    const coordinator = createRuntimeCoordinator({ responseProcessingPipeline: rejectingResponsePipeline })

    const result = coordinator.coordinate(makeRuntimeOrchestrationInputs())

    expect(result.completionStatus).toBe('failed')
    expect(result.diagnostics.validationResult.issues.some((issue) => issue.type === 'response-pipeline-failure')).toBe(true)
    expect(result.diagnostics.completedStages.at(-1)).toBe('failed')
  })
})
