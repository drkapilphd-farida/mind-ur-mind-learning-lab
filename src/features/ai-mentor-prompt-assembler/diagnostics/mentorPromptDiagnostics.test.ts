import { describe, expect, it } from 'vitest'
import { generateMentorPromptDiagnostics } from './generateMentorPromptDiagnostics'
import { makeMentorPromptPayload } from '../testFixtures'

describe('generateMentorPromptDiagnostics', () => {
  it('reports complete, correct section count, and validation status for a fully populated payload', () => {
    const payload = makeMentorPromptPayload({ version: 2 })
    const diagnostics = generateMentorPromptDiagnostics(payload, { valid: true, issues: [] })
    expect(diagnostics).toEqual({ payloadCompleteness: 'complete', sectionCount: 6, validationStatus: 'valid', payloadVersion: 2 })
  })

  it('reports empty when no section has any values', () => {
    const payload = makeMentorPromptPayload({
      sections: [
        { type: 'system-context', values: [] },
        { type: 'learner-context', values: [] },
      ],
    })
    const diagnostics = generateMentorPromptDiagnostics(payload, { valid: false, issues: [] })
    expect(diagnostics.payloadCompleteness).toBe('empty')
    expect(diagnostics.sectionCount).toBe(2)
    expect(diagnostics.validationStatus).toBe('invalid')
  })

  it('reports partial when some but not all sections have values', () => {
    const payload = makeMentorPromptPayload({
      sections: [
        { type: 'system-context', values: ['x'] },
        { type: 'learner-context', values: [] },
      ],
    })
    const diagnostics = generateMentorPromptDiagnostics(payload, { valid: true, issues: [] })
    expect(diagnostics.payloadCompleteness).toBe('partial')
  })
})
