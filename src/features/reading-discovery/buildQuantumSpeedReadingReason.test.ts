import { describe, expect, it } from 'vitest'
import { buildQuantumSpeedReadingReason } from './buildQuantumSpeedReadingReason'

describe('buildQuantumSpeedReadingReason', () => {
  it('FIX-05 — ties the real reason directly to the real biggest improvement', () => {
    expect(buildQuantumSpeedReadingReason('Read Bigger Chunks')).toContain('more words at once')
  })

  it('FIX-05 — falls back to an honest, generic reason for an unrecognized input', () => {
    expect(() => buildQuantumSpeedReadingReason('Something Unexpected')).not.toThrow()
  })
})
