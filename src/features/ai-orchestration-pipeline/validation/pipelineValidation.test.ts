import { describe, expect, it } from 'vitest'
import { validatePipelineIntegrity } from './validatePipelineIntegrity'
import { makeAIOrchestrationResult } from '../testFixtures'

describe('validatePipelineIntegrity', () => {
  it('reports valid: true for a well-formed, completed result', () => {
    expect(validatePipelineIntegrity(makeAIOrchestrationResult(), {})).toEqual({ valid: true, issues: [] })
  })

  it('detects a missing-stage when completed but completedStages is truncated', () => {
    const result = makeAIOrchestrationResult({
      context: { learnerId: 'learner-1', profileId: 'profile-1', stage: 'completed', completedStages: ['initialized', 'context-ready'] },
    })
    const validation = validatePipelineIntegrity(result, {})
    expect(validation.valid).toBe(false)
    expect(validation.issues.some((issue) => issue.type === 'missing-stage')).toBe(true)
  })

  it('detects an invalid-transition when completedStages is out of order', () => {
    const result = makeAIOrchestrationResult({
      completionStatus: 'failed',
      responseText: null,
      context: { learnerId: 'learner-1', profileId: 'profile-1', stage: 'failed', completedStages: ['initialized', 'prompt-ready'] },
    })
    const validation = validatePipelineIntegrity(result, {})
    expect(validation.issues.some((issue) => issue.type === 'invalid-transition')).toBe(true)
  })

  it('detects duplicate-execution for a repeated stage', () => {
    const result = makeAIOrchestrationResult({
      completionStatus: 'failed',
      responseText: null,
      context: { learnerId: 'learner-1', profileId: 'profile-1', stage: 'failed', completedStages: ['initialized', 'initialized'] },
    })
    const validation = validatePipelineIntegrity(result, {})
    expect(validation.issues.some((issue) => issue.type === 'duplicate-execution')).toBe(true)
  })

  it('detects a configuration-violation when completedStages exceeds maxPipelineStages', () => {
    const validation = validatePipelineIntegrity(makeAIOrchestrationResult(), { maxPipelineStages: 2 })
    expect(validation.issues.some((issue) => issue.type === 'configuration-violation')).toBe(true)
  })

  it('detects a pipeline-integrity issue when completed but responseText is null', () => {
    const result = makeAIOrchestrationResult({ responseText: null })
    const validation = validatePipelineIntegrity(result, {})
    expect(validation.issues.some((issue) => issue.type === 'pipeline-integrity')).toBe(true)
  })

  it('does not flag configuration compliance when no maxPipelineStages fact is configured', () => {
    expect(validatePipelineIntegrity(makeAIOrchestrationResult(), {}).valid).toBe(true)
  })
})
