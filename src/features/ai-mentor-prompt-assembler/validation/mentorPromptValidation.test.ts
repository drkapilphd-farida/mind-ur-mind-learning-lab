import { describe, expect, it } from 'vitest'
import { validatePromptPayload } from './validatePromptPayload'
import { makeMentorPromptPayload } from '../testFixtures'

describe('validatePromptPayload', () => {
  it('reports valid: true for a well-formed, already-ordered payload', () => {
    expect(validatePromptPayload(makeMentorPromptPayload(), {})).toEqual({ valid: true, issues: [] })
  })

  it('detects a missing-section', () => {
    const payload = makeMentorPromptPayload({
      sections: [
        { type: 'system-context', values: ['x'] },
        { type: 'learner-context', values: ['x'] },
        { type: 'current-journey', values: ['x'] },
        { type: 'recommendations', values: ['x'] },
        { type: 'next-actions', values: ['x'] },
      ],
    })
    const result = validatePromptPayload(payload, {})
    expect(result.valid).toBe(false)
    expect(result.issues.some((issue) => issue.type === 'missing-section')).toBe(true)
  })

  it('detects a duplicate-section', () => {
    const payload = makeMentorPromptPayload({
      sections: [
        { type: 'system-context', values: ['x'] },
        { type: 'system-context', values: ['y'] },
      ],
    })
    const result = validatePromptPayload(payload, {})
    expect(result.issues.some((issue) => issue.type === 'duplicate-section')).toBe(true)
  })

  it('detects an invalid-reference when a section has a blank value', () => {
    const payload = makeMentorPromptPayload({ sections: [{ type: 'system-context', values: [''] }] })
    const result = validatePromptPayload(payload, {})
    expect(result.issues.some((issue) => issue.type === 'invalid-reference')).toBe(true)
  })

  it('detects an invalid-ordering when sections are out of the fixed order', () => {
    const payload = makeMentorPromptPayload({
      sections: [
        { type: 'metadata', values: ['1'] },
        { type: 'system-context', values: ['x'] },
      ],
    })
    const result = validatePromptPayload(payload, {})
    expect(result.issues.some((issue) => issue.type === 'invalid-ordering')).toBe(true)
  })

  it('detects a configuration-violation when a section exceeds maxSectionValues', () => {
    const payload = makeMentorPromptPayload({ sections: [{ type: 'system-context', values: ['a', 'b'] }] })
    const result = validatePromptPayload(payload, { maxSectionValues: 1 })
    expect(result.issues.some((issue) => issue.type === 'configuration-violation')).toBe(true)
  })

  it('does not flag configuration compliance when no maxSectionValues fact is configured', () => {
    expect(validatePromptPayload(makeMentorPromptPayload(), {}).valid).toBe(true)
  })
})
