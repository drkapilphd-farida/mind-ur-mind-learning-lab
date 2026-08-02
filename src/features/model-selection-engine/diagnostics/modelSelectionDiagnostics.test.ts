import { describe, expect, it } from 'vitest'
import { generateModelSelectionDiagnostics } from './generateModelSelectionDiagnostics'
import { makeModelSelectionOutcome, makeModelSelectionRequest, makeModelSelectionValidation } from '../testFixtures'

describe('generateModelSelectionDiagnostics', () => {
  it('collects the request, candidate count, priority order, resolution path, selection, and validation result', () => {
    const request = makeModelSelectionRequest({ providerId: 'openai', requestedCapability: 'vision', preferredModelId: 'gpt-4o' })
    const outcome = makeModelSelectionOutcome({ selectedModelId: 'gpt-4o', resolutionPath: 'preferred' })
    const validationResult = makeModelSelectionValidation()

    const diagnostics = generateModelSelectionDiagnostics(request, 2, ['gpt-4o', 'gpt-4o-mini'], outcome, validationResult)

    expect(diagnostics).toEqual({
      providerId: 'openai',
      requestedCapability: 'vision',
      preferredModelId: 'gpt-4o',
      candidateCount: 2,
      priorityOrder: ['gpt-4o', 'gpt-4o-mini'],
      resolutionPath: 'preferred',
      selectedModelId: 'gpt-4o',
      validationResult: { valid: true, issues: [] },
    })
  })

  it('reflects a "none" resolution with a null selection', () => {
    const request = makeModelSelectionRequest({ providerId: 'openai' })
    const outcome = makeModelSelectionOutcome({ selectedModelId: null, resolutionPath: 'none' })

    const diagnostics = generateModelSelectionDiagnostics(request, 0, [], outcome, makeModelSelectionValidation())

    expect(diagnostics.selectedModelId).toBeNull()
    expect(diagnostics.resolutionPath).toBe('none')
  })
})
