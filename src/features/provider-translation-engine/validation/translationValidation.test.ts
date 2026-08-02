import { describe, expect, it } from 'vitest'
import { validateProviderRequest } from './validateProviderRequest'
import { makeProviderRequest } from '../testFixtures'

describe('validateProviderRequest', () => {
  it('reports valid: true for a well-formed OpenAI request (6 messages)', () => {
    const request = makeProviderRequest({ providerId: 'openai' })
    expect(validateProviderRequest(request, 1, {})).toEqual({ valid: true, issues: [] })
  })

  it('reports valid: true for a well-formed Anthropic request (5 messages, folded system section)', () => {
    const request = makeProviderRequest({
      providerId: 'anthropic',
      messages: [
        { role: 'user', content: 'a' },
        { role: 'user', content: 'b' },
        { role: 'user', content: 'c' },
        { role: 'user', content: 'd' },
        { role: 'user', content: 'e' },
      ],
    })
    expect(validateProviderRequest(request, 1, {})).toEqual({ valid: true, issues: [] })
  })

  it('detects a missing-section when coverage falls short of the expected count', () => {
    const request = makeProviderRequest({ providerId: 'openai', messages: [{ role: 'system', content: 'x' }] })
    const result = validateProviderRequest(request, 1, {})
    expect(result.valid).toBe(false)
    expect(result.issues.some((issue) => issue.type === 'missing-section')).toBe(true)
  })

  it('detects an invalid-mapping for blank message content', () => {
    const request = makeProviderRequest({ messages: [{ role: 'system', content: '' }] })
    const result = validateProviderRequest(request, 1, {})
    expect(result.issues.some((issue) => issue.type === 'invalid-mapping')).toBe(true)
  })

  it('detects a duplicate-mapping for repeated instruction ids', () => {
    const request = makeProviderRequest({
      instructions: [
        { id: 'system-baseline', directive: 'maintain-mentor-persona' },
        { id: 'system-baseline', directive: 'maintain-mentor-persona' },
      ],
    })
    const result = validateProviderRequest(request, 1, {})
    expect(result.issues.some((issue) => issue.type === 'duplicate-mapping')).toBe(true)
  })

  it('detects a duplicate-mapping for repeated identical messages', () => {
    const request = makeProviderRequest({
      messages: [
        { role: 'user', content: 'same' },
        { role: 'user', content: 'same' },
      ],
    })
    const result = validateProviderRequest(request, 1, {})
    expect(result.issues.some((issue) => issue.type === 'duplicate-mapping')).toBe(true)
  })

  it('detects a version-incompatible source payload', () => {
    const request = makeProviderRequest()
    const result = validateProviderRequest(request, 2, {})
    expect(result.issues.some((issue) => issue.type === 'version-incompatible')).toBe(true)
  })

  it('detects a configuration-violation when messages exceed maxMessages', () => {
    const request = makeProviderRequest({ providerId: 'openai' })
    const result = validateProviderRequest(request, 1, { maxMessages: 2 })
    expect(result.issues.some((issue) => issue.type === 'configuration-violation')).toBe(true)
  })

  it('does not flag configuration compliance when no maxMessages fact is configured', () => {
    const request = makeProviderRequest({ providerId: 'openai' })
    expect(validateProviderRequest(request, 1, {}).valid).toBe(true)
  })
})
