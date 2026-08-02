import { describe, expect, it } from 'vitest'
import { computeSmartNotesEngagementLevel } from './computeSmartNotesEngagementLevel'

describe('computeSmartNotesEngagementLevel', () => {
  it('classifies real high engagement as strong', () => {
    expect(computeSmartNotesEngagementLevel(0.75)).toBe('strong')
    expect(computeSmartNotesEngagementLevel(1)).toBe('strong')
  })

  it('classifies real mid engagement as developing', () => {
    expect(computeSmartNotesEngagementLevel(0.45)).toBe('developing')
    expect(computeSmartNotesEngagementLevel(0.74)).toBe('developing')
  })

  it('classifies real low engagement as needs-review', () => {
    expect(computeSmartNotesEngagementLevel(0.44)).toBe('needs-review')
    expect(computeSmartNotesEngagementLevel(0)).toBe('needs-review')
  })
})
