import { describe, expect, it } from 'vitest'
import { AdaptiveMemoryCoach } from './adaptiveMemoryCoach'
import { pickAdaptiveEncouragement } from './pickAdaptiveEncouragement'

describe('pickAdaptiveEncouragement', () => {
  it('is honest with no real evidence yet — no forced line', () => {
    const coach = new AdaptiveMemoryCoach()
    expect(pickAdaptiveEncouragement(coach)).toBeNull()
  })

  it('FIX-07 — several real correct answers in a row surface the brief\'s own exact line', () => {
    const coach = new AdaptiveMemoryCoach()
    coach.recordOutcome(true, 400)
    coach.recordOutcome(true, 400)
    expect(pickAdaptiveEncouragement(coach)).toBe('You’re remembering faster now.')
  })

  it('FIX-07 — a real recent miss surfaces an encouraging, never-mentions-failure line', () => {
    const coach = new AdaptiveMemoryCoach()
    coach.recordOutcome(false, 400)
    const message = pickAdaptiveEncouragement(coach)
    expect(message).toBe('Let’s try another one.')
    expect(message).not.toMatch(/fail|wrong|difficulty|harder|easier/i)
  })
})
