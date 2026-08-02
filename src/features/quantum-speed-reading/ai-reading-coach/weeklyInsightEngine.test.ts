import { describe, it, expect } from 'vitest'
import { generateWeeklyInsight } from './weeklyInsightEngine'
import { buildSession } from './testFixtures'

const NOW = new Date('2026-07-14T12:00:00.000Z').getTime()

describe('generateWeeklyInsight', () => {
  it('is honest when there are no sessions this week', () => {
    const insight = generateWeeklyInsight([], NOW)
    expect(insight).toContain('No sessions yet this week')
  })

  it('reports real stats when there is no prior week to compare against', () => {
    const sessions = [buildSession({ occurredAt: '2026-07-13T12:00:00.000Z', wpm: 220, comprehensionPercent: 85 })]
    const insight = generateWeeklyInsight(sessions, NOW)
    expect(insight).toContain('220 WPM')
    expect(insight).toContain('85%')
  })

  it('reports comprehension improving more than speed', () => {
    const sessions = [
      buildSession({ occurredAt: '2026-07-13T12:00:00.000Z', wpm: 200, comprehensionPercent: 95 }),
      buildSession({ occurredAt: '2026-07-05T12:00:00.000Z', wpm: 200, comprehensionPercent: 70 }),
    ]
    const insight = generateWeeklyInsight(sessions, NOW)
    expect(insight).toBe('This week your comprehension improved more than your speed.')
  })

  it('reports speed improving more than comprehension', () => {
    const sessions = [
      buildSession({ occurredAt: '2026-07-13T12:00:00.000Z', wpm: 300, comprehensionPercent: 80 }),
      buildSession({ occurredAt: '2026-07-05T12:00:00.000Z', wpm: 150, comprehensionPercent: 80 }),
    ]
    const insight = generateWeeklyInsight(sessions, NOW)
    expect(insight).toBe('This week your reading speed improved more than your comprehension.')
  })

  it('reports stronger consistency when session count rose meaningfully', () => {
    const sessions = [
      buildSession({ occurredAt: '2026-07-13T12:00:00.000Z', wpm: 200, comprehensionPercent: 80 }),
      buildSession({ occurredAt: '2026-07-12T12:00:00.000Z', wpm: 200, comprehensionPercent: 80 }),
      buildSession({ occurredAt: '2026-07-11T12:00:00.000Z', wpm: 200, comprehensionPercent: 80 }),
      buildSession({ occurredAt: '2026-07-05T12:00:00.000Z', wpm: 200, comprehensionPercent: 80 }),
    ]
    const insight = generateWeeklyInsight(sessions, NOW)
    expect(insight).toBe('Your reading consistency has become much stronger.')
  })

  it('recognizes comfort with intermediate passages', () => {
    const sessions = [
      buildSession({ occurredAt: '2026-07-13T12:00:00.000Z', difficulty: 'medium', wpm: 200, comprehensionPercent: 85 }),
      buildSession({ occurredAt: '2026-07-05T12:00:00.000Z', difficulty: 'easy', wpm: 200, comprehensionPercent: 85 }),
    ]
    const insight = generateWeeklyInsight(sessions, NOW)
    expect(insight).toBe('You are now comfortable with intermediate passages.')
  })

  it('only counts completed sessions', () => {
    const sessions = [buildSession({ occurredAt: '2026-07-13T12:00:00.000Z', completed: false })]
    const insight = generateWeeklyInsight(sessions, NOW)
    expect(insight).toContain('No sessions yet this week')
  })
})
