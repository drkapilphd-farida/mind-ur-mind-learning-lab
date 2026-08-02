import { describe, expect, it } from 'vitest'
import { computeMemoryStrengthLevel } from './computeMemoryStrengthLevel'

describe('computeMemoryStrengthLevel', () => {
  it('classifies real high confidence as strong', () => {
    expect(computeMemoryStrengthLevel(0.75)).toBe('strong')
    expect(computeMemoryStrengthLevel(1)).toBe('strong')
  })

  it('classifies real mid confidence as developing', () => {
    expect(computeMemoryStrengthLevel(0.45)).toBe('developing')
    expect(computeMemoryStrengthLevel(0.74)).toBe('developing')
  })

  it('classifies real low confidence as needs-review', () => {
    expect(computeMemoryStrengthLevel(0.44)).toBe('needs-review')
    expect(computeMemoryStrengthLevel(0)).toBe('needs-review')
  })
})
