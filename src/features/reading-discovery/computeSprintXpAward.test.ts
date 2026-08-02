import { describe, expect, it } from 'vitest'
import { computeSprintXpAward } from './computeSprintXpAward'

describe('computeSprintXpAward', () => {
  it('awards a real, fixed amount for a stimulus scene', () => {
    expect(computeSprintXpAward('stimulus')).toBe(40)
  })

  it('awards a real, fixed, smaller amount for a question scene', () => {
    expect(computeSprintXpAward('question')).toBe(20)
  })

  it('is deterministic', () => {
    expect(computeSprintXpAward('stimulus')).toBe(computeSprintXpAward('stimulus'))
  })
})
