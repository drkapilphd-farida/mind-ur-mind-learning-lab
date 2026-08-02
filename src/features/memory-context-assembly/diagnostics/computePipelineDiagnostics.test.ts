import { describe, expect, it } from 'vitest'
import { computePipelineDiagnostics } from './computePipelineDiagnostics'
import { makeContextPackage, makeContextReference, makeContextSection } from '../testFixtures'

describe('computePipelineDiagnostics', () => {
  it('reports input and selected counts as given', () => {
    const contextPackage = makeContextPackage({ sections: [] })
    const diagnostics = computePipelineDiagnostics(10, 5, contextPackage, { valid: true, issues: [] })
    expect(diagnostics.inputMemoryCount).toBe(10)
    expect(diagnostics.selectedMemoryCount).toBe(5)
  })

  it('computes trimmedMemoryCount as selected minus packaged references', () => {
    const contextPackage = makeContextPackage({
      sections: [makeContextSection({ references: [makeContextReference({ memoryId: 'a' })] })],
    })
    const diagnostics = computePipelineDiagnostics(10, 5, contextPackage, { valid: true, issues: [] })
    expect(diagnostics.trimmedMemoryCount).toBe(4)
  })

  it('reports validationStatus valid when the validation result is valid', () => {
    const contextPackage = makeContextPackage()
    expect(computePipelineDiagnostics(1, 1, contextPackage, { valid: true, issues: [] }).validationStatus).toBe('valid')
  })

  it('reports validationStatus invalid when the validation result is invalid', () => {
    const contextPackage = makeContextPackage()
    const result = { valid: false, issues: [{ type: 'empty-package' as const, detail: 'x' }] }
    expect(computePipelineDiagnostics(1, 1, contextPackage, result).validationStatus).toBe('invalid')
  })

  it('reports packageVersion from the package metadata', () => {
    const contextPackage = makeContextPackage({ metadata: { sessionId: null, generatedAt: 'x', version: 3 } })
    expect(computePipelineDiagnostics(1, 1, contextPackage, { valid: true, issues: [] }).packageVersion).toBe(3)
  })
})
