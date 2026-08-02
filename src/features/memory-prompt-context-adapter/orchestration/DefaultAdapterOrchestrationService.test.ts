import { describe, expect, it } from 'vitest'
import { createAdapterOrchestrationService } from './DefaultAdapterOrchestrationService'
import { makeContextPackage, makeSequentialClock } from '../testFixtures'

describe('DefaultAdapterOrchestrationService', () => {
  it('execute() transforms, validates, and produces diagnostics together', () => {
    const service = createAdapterOrchestrationService({
      clock: makeSequentialClock('2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
    })
    const contextPackage = makeContextPackage()
    const result = service.execute(contextPackage, null)

    expect(result.payload.metadata.sourcePackageId).toBe(contextPackage.id)
    expect(result.validationResult.valid).toBe(true)
    expect(result.diagnostics.validationStatus).toBe('valid')
    expect(result.diagnostics.sectionCount).toBe(result.payload.sections.length)
  })

  it('measures a nonzero transformationDurationMs when the clock advances between calls', () => {
    const service = createAdapterOrchestrationService({
      clock: makeSequentialClock('2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.500Z'),
    })
    const result = service.execute(makeContextPackage(), null)
    expect(result.diagnostics.transformationDurationMs).toBe(500)
  })

  it('reports validationStatus invalid for a package that transforms into an empty payload', () => {
    const service = createAdapterOrchestrationService({
      clock: makeSequentialClock('2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
    })
    const contextPackage = makeContextPackage({ sections: [] })
    const result = service.execute(contextPackage, null)
    expect(result.diagnostics.validationStatus).toBe('invalid')
  })

  it('applies payloadLimits through to the returned payload', () => {
    const service = createAdapterOrchestrationService({
      clock: makeSequentialClock('2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
    })
    const contextPackage = makeContextPackage({
      sections: [
        { id: 'a', priority: 'critical', references: [{ memoryId: 'a', priority: 'critical', reason: 'x' }] },
        { id: 'b', priority: 'low', references: [{ memoryId: 'b', priority: 'low', reason: 'y' }] },
      ],
    })
    const result = service.execute(contextPackage, { maxSections: 1, maxMemoryCount: null, maxPayloadSize: null })
    expect(result.payload.sections).toHaveLength(1)
  })

  it('uses default dependencies when no overrides are given', () => {
    const service = createAdapterOrchestrationService()
    const result = service.execute(makeContextPackage(), null)
    expect(result.payload.id).toBeTruthy()
    expect(result.diagnostics.transformationDurationMs).toBeGreaterThanOrEqual(0)
  })
})
