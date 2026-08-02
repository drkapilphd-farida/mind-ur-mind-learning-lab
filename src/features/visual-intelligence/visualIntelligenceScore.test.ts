import { describe, expect, it } from 'vitest'
import { computeVisualIntelligenceScore } from './visualIntelligenceScore'

describe('computeVisualIntelligenceScore', () => {
  it('returns 0 when there are no active dimensions', () => {
    expect(computeVisualIntelligenceScore([])).toBe(0)
  })

  it('scales a single dimension score by 10, capped at 1000', () => {
    expect(computeVisualIntelligenceScore([60])).toBe(600)
    expect(computeVisualIntelligenceScore([100])).toBe(1000)
  })

  it('averages multiple active dimension scores before scaling', () => {
    expect(computeVisualIntelligenceScore([100, 50])).toBe(750)
  })

  it('never exceeds 1000', () => {
    expect(computeVisualIntelligenceScore([100, 100, 100])).toBe(1000)
  })
})
