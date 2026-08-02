import { describe, expect, it } from 'vitest'
import { validateProviderExecutionRequest } from './validateProviderExecutionRequest'
import { makeProviderExecutionRequest } from '../testFixtures'

describe('validateProviderExecutionRequest', () => {
  it('reports valid: true for a well-formed request', () => {
    expect(validateProviderExecutionRequest(makeProviderExecutionRequest(), {})).toEqual({ valid: true, issues: [] })
  })

  it('detects missing-field for a blank modelId', () => {
    const request = makeProviderExecutionRequest({ modelId: '' })
    const result = validateProviderExecutionRequest(request, {})
    expect(result.issues.some((issue) => issue.type === 'missing-field')).toBe(true)
  })

  it('detects missing-field for empty messages', () => {
    const request = makeProviderExecutionRequest({ messages: [] })
    const result = validateProviderExecutionRequest(request, {})
    expect(result.issues.some((issue) => issue.type === 'missing-field')).toBe(true)
  })

  it('detects missing-field for empty context facts', () => {
    const request = makeProviderExecutionRequest({ context: { learnerId: 'learner-1', profileId: 'profile-1', facts: [] } })
    const result = validateProviderExecutionRequest(request, {})
    expect(result.issues.some((issue) => issue.type === 'missing-field')).toBe(true)
  })

  it('detects unsupported-version', () => {
    const request = makeProviderExecutionRequest({ version: 2 })
    const result = validateProviderExecutionRequest(request, {})
    expect(result.issues.some((issue) => issue.type === 'unsupported-version')).toBe(true)
  })

  it('detects duplicate-metadata for repeated instruction ids', () => {
    const request = makeProviderExecutionRequest({
      instructions: [
        { id: 'safety-baseline', directive: 'enforce-standard-safety-level' },
        { id: 'safety-baseline', directive: 'enforce-standard-safety-level' },
      ],
    })
    const result = validateProviderExecutionRequest(request, {})
    expect(result.issues.some((issue) => issue.type === 'duplicate-metadata')).toBe(true)
  })

  it('detects duplicate-metadata for repeated identical messages', () => {
    const request = makeProviderExecutionRequest({
      messages: [
        { role: 'user', content: 'same' },
        { role: 'user', content: 'same' },
      ],
    })
    const result = validateProviderExecutionRequest(request, {})
    expect(result.issues.some((issue) => issue.type === 'duplicate-metadata')).toBe(true)
  })

  it('detects a configuration-violation when maxOutputTokens is exceeded', () => {
    const request = makeProviderExecutionRequest({ options: { temperature: 0.7, maxOutputTokens: 2000 } })
    const result = validateProviderExecutionRequest(request, { maxOutputTokens: 1000 })
    expect(result.issues.some((issue) => issue.type === 'configuration-violation')).toBe(true)
  })

  it('does not flag configuration compliance when no maxOutputTokens fact is configured', () => {
    expect(validateProviderExecutionRequest(makeProviderExecutionRequest(), {}).valid).toBe(true)
  })
})
