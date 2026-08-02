import { describe, expect, it } from 'vitest'
import { validateProviderExecutionResponse } from './validateProviderExecutionResponse'
import { makeProviderExecutionResponse } from '../testFixtures'

describe('validateProviderExecutionResponse', () => {
  it('reports valid: true for a well-formed response', () => {
    expect(validateProviderExecutionResponse(makeProviderExecutionResponse(), 1, {})).toEqual({ valid: true, issues: [] })
  })

  it('detects missing-content for blank text', () => {
    const response = makeProviderExecutionResponse({ content: { text: '', finishReason: 'stop' } })
    const result = validateProviderExecutionResponse(response, 1, {})
    expect(result.issues.some((issue) => issue.type === 'missing-content')).toBe(true)
  })

  it('detects invalid-metadata for a blank metadata field', () => {
    const response = makeProviderExecutionResponse({ metadata: { learnerId: '', profileId: 'profile-1', source: 'test', generatedAt: '2026-01-01T00:00:00.000Z' } })
    const result = validateProviderExecutionResponse(response, 1, {})
    expect(result.issues.some((issue) => issue.type === 'invalid-metadata')).toBe(true)
  })

  it('detects unsupported-provider-version', () => {
    const result = validateProviderExecutionResponse(makeProviderExecutionResponse(), 2, {})
    expect(result.issues.some((issue) => issue.type === 'unsupported-provider-version')).toBe(true)
  })

  it('detects duplicate-sections for repeated safety flags', () => {
    const response = makeProviderExecutionResponse({ safetyFlags: ['content-filtered', 'content-filtered'] })
    const result = validateProviderExecutionResponse(response, 1, {})
    expect(result.issues.some((issue) => issue.type === 'duplicate-sections')).toBe(true)
  })

  it('detects a configuration-violation when completionTokens exceeds maxCompletionTokens', () => {
    const response = makeProviderExecutionResponse({ usage: { promptTokens: 10, completionTokens: 500, totalTokens: 510 } })
    const result = validateProviderExecutionResponse(response, 1, { maxCompletionTokens: 100 })
    expect(result.issues.some((issue) => issue.type === 'configuration-violation')).toBe(true)
  })

  it('does not flag configuration compliance when no maxCompletionTokens fact is configured', () => {
    expect(validateProviderExecutionResponse(makeProviderExecutionResponse(), 1, {}).valid).toBe(true)
  })
})
