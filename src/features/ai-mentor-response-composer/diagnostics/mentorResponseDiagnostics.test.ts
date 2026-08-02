import { describe, expect, it } from 'vitest'
import { generateMentorResponseDiagnostics } from './generateMentorResponseDiagnostics'
import { makeMentorResponse } from '../testFixtures'

describe('generateMentorResponseDiagnostics', () => {
  it('reports complete, correct section count, and validation status for a fully populated response', () => {
    const response = makeMentorResponse({ version: 2 })
    const diagnostics = generateMentorResponseDiagnostics(response, { valid: true, issues: [] })
    expect(diagnostics).toEqual({ responseCompleteness: 'complete', sectionCount: 6, validationStatus: 'valid', responseVersion: 2 })
  })

  it('reports empty when no section has any cards or actions', () => {
    const response = makeMentorResponse({
      sections: [
        { type: 'greeting-context', cards: [], actions: [] },
        { type: 'learning-summary', cards: [], actions: [] },
      ],
    })
    const diagnostics = generateMentorResponseDiagnostics(response, { valid: false, issues: [] })
    expect(diagnostics.responseCompleteness).toBe('empty')
    expect(diagnostics.sectionCount).toBe(2)
    expect(diagnostics.validationStatus).toBe('invalid')
  })

  it('reports partial when some but not all sections have content', () => {
    const response = makeMentorResponse({
      sections: [
        { type: 'greeting-context', cards: [{ id: 'a', title: 't', values: ['x'] }], actions: [] },
        { type: 'learning-summary', cards: [], actions: [] },
      ],
    })
    const diagnostics = generateMentorResponseDiagnostics(response, { valid: true, issues: [] })
    expect(diagnostics.responseCompleteness).toBe('partial')
  })
})
