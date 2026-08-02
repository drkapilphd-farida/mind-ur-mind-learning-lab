import { describe, expect, it } from 'vitest'
import { computeAdapterDiagnostics } from './computeAdapterDiagnostics'
import { makeContextPayload, makeContextPayloadSection } from '../testFixtures'

describe('computeAdapterDiagnostics', () => {
  it('reports sourcePackageVersion and payloadVersion', () => {
    const payload = makeContextPayload({
      metadata: { sessionId: null, sourcePackageId: 'p', sourcePackageVersion: 5, generatedAt: 'x', payloadVersion: 1 },
    })
    const diagnostics = computeAdapterDiagnostics(payload, 5, { valid: true, issues: [] }, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z')
    expect(diagnostics.sourcePackageVersion).toBe(5)
    expect(diagnostics.payloadVersion).toBe(1)
  })

  it('counts sectionCount and referenceCount', () => {
    const payload = makeContextPayload({
      sections: [
        makeContextPayloadSection({ id: 's1', references: [{ memoryId: 'a', priority: 'high', reason: 'x' }, { memoryId: 'b', priority: 'high', reason: 'x' }] }),
        makeContextPayloadSection({ id: 's2', priority: 'low', references: [{ memoryId: 'c', priority: 'low', reason: 'x' }] }),
      ],
    })
    const diagnostics = computeAdapterDiagnostics(payload, 1, { valid: true, issues: [] }, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z')
    expect(diagnostics.sectionCount).toBe(2)
    expect(diagnostics.referenceCount).toBe(3)
  })

  it('reports validationStatus from the given validation result', () => {
    const payload = makeContextPayload()
    expect(computeAdapterDiagnostics(payload, 1, { valid: true, issues: [] }, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z').validationStatus).toBe('valid')
    expect(computeAdapterDiagnostics(payload, 1, { valid: false, issues: [{ type: 'empty-payload', detail: 'x' }] }, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z').validationStatus).toBe(
      'invalid',
    )
  })

  it('computes transformationDurationMs from the given start/finish timestamps', () => {
    const payload = makeContextPayload()
    const diagnostics = computeAdapterDiagnostics(
      payload,
      1,
      { valid: true, issues: [] },
      '2026-01-01T00:00:00.000Z',
      '2026-01-01T00:00:00.250Z',
    )
    expect(diagnostics.transformationDurationMs).toBe(250)
  })

  it('reports a duration of 0 when start and finish are identical (fully deterministic under a fixed clock)', () => {
    const payload = makeContextPayload()
    const diagnostics = computeAdapterDiagnostics(payload, 1, { valid: true, issues: [] }, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z')
    expect(diagnostics.transformationDurationMs).toBe(0)
  })
})
