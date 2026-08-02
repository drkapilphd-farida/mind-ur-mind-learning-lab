import { describe, expect, it } from 'vitest'
import { validateMentorResponse } from './validateMentorResponse'
import { makeMentorResponse } from '../testFixtures'

describe('validateMentorResponse', () => {
  it('reports valid: true for a well-formed, already-ordered response', () => {
    expect(validateMentorResponse(makeMentorResponse(), {})).toEqual({ valid: true, issues: [] })
  })

  it('detects an empty-response when every section has no cards and no actions', () => {
    const response = makeMentorResponse({
      sections: [
        { type: 'greeting-context', cards: [], actions: [] },
        { type: 'learning-summary', cards: [], actions: [] },
        { type: 'active-recommendation-summary', cards: [], actions: [] },
        { type: 'next-action', cards: [], actions: [] },
        { type: 'progress-summary', cards: [], actions: [] },
        { type: 'motivation-metadata', cards: [], actions: [] },
      ],
    })
    const result = validateMentorResponse(response, {})
    expect(result.valid).toBe(false)
    expect(result.issues).toEqual([{ type: 'empty-response', referenceId: null, detail: expect.any(String) }])
  })

  it('detects a duplicate-section', () => {
    const response = makeMentorResponse({
      sections: [
        { type: 'greeting-context', cards: [{ id: 'a', title: 't', values: ['x'] }], actions: [] },
        { type: 'greeting-context', cards: [{ id: 'b', title: 't', values: ['y'] }], actions: [] },
      ],
    })
    const result = validateMentorResponse(response, {})
    expect(result.issues.some((issue) => issue.type === 'duplicate-section')).toBe(true)
  })

  it('detects a missing-reference when an action has a blank referenceId', () => {
    const response = makeMentorResponse({
      sections: [{ type: 'next-action', cards: [], actions: [{ id: 'action-1', label: 'review-exercise', referenceId: '' }] }],
    })
    const result = validateMentorResponse(response, {})
    expect(result.issues.some((issue) => issue.type === 'missing-reference')).toBe(true)
  })

  it('detects an invalid-ordering when sections are out of the fixed order', () => {
    const response = makeMentorResponse({
      sections: [
        { type: 'motivation-metadata', cards: [{ id: 'a', title: 't', values: ['1'] }], actions: [] },
        { type: 'greeting-context', cards: [{ id: 'b', title: 't', values: ['active'] }], actions: [] },
      ],
    })
    const result = validateMentorResponse(response, {})
    expect(result.issues.some((issue) => issue.type === 'invalid-ordering')).toBe(true)
  })

  it('detects a configuration-violation when a section exceeds maxCardsPerSection', () => {
    const response = makeMentorResponse({
      sections: [
        {
          type: 'greeting-context',
          cards: [
            { id: 'a', title: 't', values: ['1'] },
            { id: 'b', title: 't', values: ['2'] },
          ],
          actions: [],
        },
      ],
    })
    const result = validateMentorResponse(response, { maxCardsPerSection: 1 })
    expect(result.issues.some((issue) => issue.type === 'configuration-violation')).toBe(true)
  })

  it('does not flag configuration compliance when no maxCardsPerSection fact is configured', () => {
    expect(validateMentorResponse(makeMentorResponse(), {}).valid).toBe(true)
  })
})
