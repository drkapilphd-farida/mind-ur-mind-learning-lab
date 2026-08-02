import { describe, expect, it } from 'vitest'
import { generateProviderSelectionDiagnostics } from './generateProviderSelectionDiagnostics'
import { makeProviderSelectionOutcome, makeProviderSelectionRequest, makeProviderSelectionValidation } from '../testFixtures'

describe('generateProviderSelectionDiagnostics', () => {
  it('collects the request, candidate count, priority order, resolution path, selection, and validation result', () => {
    const request = makeProviderSelectionRequest({ requestedCapability: 'vision', preferredProviderId: 'openai' })
    const outcome = makeProviderSelectionOutcome({ selectedProviderId: 'openai', resolutionPath: 'preferred' })
    const validationResult = makeProviderSelectionValidation()

    const diagnostics = generateProviderSelectionDiagnostics(request, 3, ['openai', 'anthropic', 'gemini'], outcome, validationResult)

    expect(diagnostics).toEqual({
      requestedCapability: 'vision',
      preferredProviderId: 'openai',
      candidateCount: 3,
      priorityOrder: ['openai', 'anthropic', 'gemini'],
      resolutionPath: 'preferred',
      selectedProviderId: 'openai',
      validationResult: { valid: true, issues: [] },
    })
  })

  it('reflects a "none" resolution with a null selection', () => {
    const request = makeProviderSelectionRequest()
    const outcome = makeProviderSelectionOutcome({ selectedProviderId: null, resolutionPath: 'none' })

    const diagnostics = generateProviderSelectionDiagnostics(request, 0, [], outcome, makeProviderSelectionValidation())

    expect(diagnostics.selectedProviderId).toBeNull()
    expect(diagnostics.resolutionPath).toBe('none')
  })
})
