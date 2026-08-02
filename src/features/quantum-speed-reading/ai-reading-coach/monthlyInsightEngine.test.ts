import { describe, it, expect } from 'vitest'
import { generateMonthlyInsight } from './monthlyInsightEngine'
import { buildSession } from './testFixtures'

const NOW = new Date('2026-07-30T12:00:00.000Z').getTime()

describe('generateMonthlyInsight', () => {
  it('is honest when there are no sessions this month', () => {
    const insight = generateMonthlyInsight([], NOW)
    expect(insight).toContain('No sessions yet this month')
  })

  it('reports real stats when there is no prior month to compare against', () => {
    const sessions = [buildSession({ occurredAt: '2026-07-29T12:00:00.000Z', wpm: 220, comprehensionPercent: 85 })]
    const insight = generateMonthlyInsight(sessions, NOW)
    expect(insight).toContain('220 WPM')
    expect(insight).toContain('85%')
  })

  it('reports comprehension improving more than speed', () => {
    const sessions = [
      buildSession({ occurredAt: '2026-07-29T12:00:00.000Z', wpm: 200, comprehensionPercent: 95 }),
      buildSession({ occurredAt: '2026-06-15T12:00:00.000Z', wpm: 200, comprehensionPercent: 70 }),
    ]
    const insight = generateMonthlyInsight(sessions, NOW)
    expect(insight).toBe('This month your comprehension improved more than your speed.')
  })

  it('reports speed improving more than comprehension', () => {
    const sessions = [
      buildSession({ occurredAt: '2026-07-29T12:00:00.000Z', wpm: 300, comprehensionPercent: 80 }),
      buildSession({ occurredAt: '2026-06-15T12:00:00.000Z', wpm: 150, comprehensionPercent: 80 }),
    ]
    const insight = generateMonthlyInsight(sessions, NOW)
    expect(insight).toBe('This month your reading speed improved more than your comprehension.')
  })

  it('reports stronger consistency when session count rose meaningfully', () => {
    const sessions = [
      buildSession({ occurredAt: '2026-07-29T12:00:00.000Z', wpm: 200, comprehensionPercent: 80 }),
      buildSession({ occurredAt: '2026-07-20T12:00:00.000Z', wpm: 200, comprehensionPercent: 80 }),
      buildSession({ occurredAt: '2026-07-10T12:00:00.000Z', wpm: 200, comprehensionPercent: 80 }),
      buildSession({ occurredAt: '2026-06-15T12:00:00.000Z', wpm: 200, comprehensionPercent: 80 }),
    ]
    const insight = generateMonthlyInsight(sessions, NOW)
    expect(insight).toBe('Your reading consistency has become much stronger this month.')
  })

  it('recognizes comfort with intermediate passages', () => {
    const sessions = [
      buildSession({ occurredAt: '2026-07-29T12:00:00.000Z', difficulty: 'medium', wpm: 200, comprehensionPercent: 85 }),
      buildSession({ occurredAt: '2026-06-15T12:00:00.000Z', difficulty: 'easy', wpm: 200, comprehensionPercent: 85 }),
    ]
    const insight = generateMonthlyInsight(sessions, NOW)
    expect(insight).toBe('You have grown comfortable with intermediate passages this month.')
  })

  it('only counts completed sessions', () => {
    const sessions = [buildSession({ occurredAt: '2026-07-29T12:00:00.000Z', completed: false })]
    const insight = generateMonthlyInsight(sessions, NOW)
    expect(insight).toContain('No sessions yet this month')
  })
})
