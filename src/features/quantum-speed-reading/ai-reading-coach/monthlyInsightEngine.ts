// Monthly Insight — Sprint 6, Part 2. Mirrors weeklyInsightEngine.ts's
// exact pattern (this-window vs last-window real aggregate comparison),
// just widened to a 30-day month instead of a 7-day week. Additive: does
// not modify weeklyInsightEngine.ts.

import type { ReadingSessionRecord } from '../adaptive-intelligence/readingIntelligenceTypes'
import type { PassageDifficulty } from '../passageDifficulty'

const DAY_MS = 86_400_000
const MONTH_DAYS = 30

function average(values: readonly number[]): number | null {
  if (values.length === 0) return null
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

function daysSince(isoTimestamp: string, referenceMs: number): number {
  return Math.floor((referenceMs - new Date(isoTimestamp).getTime()) / DAY_MS)
}

function mostFrequentDifficulty(sessions: readonly ReadingSessionRecord[]): PassageDifficulty | null {
  if (sessions.length === 0) return null
  const counts = new Map<PassageDifficulty, number>()
  for (const s of sessions) counts.set(s.difficulty, (counts.get(s.difficulty) ?? 0) + 1)
  let best: PassageDifficulty | null = null
  let bestCount = -1
  for (const [difficulty, count] of counts) {
    if (count > bestCount) { best = difficulty; bestCount = count }
  }
  return best
}

export function generateMonthlyInsight(sessions: readonly ReadingSessionRecord[], referenceMs: number = Date.now()): string {
  const completed = sessions.filter((s) => s.completed)
  const thisMonth = completed.filter((s) => daysSince(s.occurredAt, referenceMs) <= MONTH_DAYS)
  const lastMonth = completed.filter((s) => {
    const d = daysSince(s.occurredAt, referenceMs)
    return d > MONTH_DAYS && d <= MONTH_DAYS * 2
  })

  if (thisMonth.length === 0) {
    return 'No sessions yet this month — complete a reading session to unlock your monthly insight.'
  }

  const avgWpmThisMonth = average(thisMonth.map((s) => s.wpm))!
  const avgComprehensionThisMonth = average(thisMonth.map((s) => s.comprehensionPercent))!

  if (lastMonth.length === 0) {
    return `You've completed ${thisMonth.length} session${thisMonth.length === 1 ? '' : 's'} this month at ${Math.round(avgWpmThisMonth)} WPM and ${Math.round(avgComprehensionThisMonth)}% comprehension — next month we'll compare your progress.`
  }

  const avgWpmLastMonth = average(lastMonth.map((s) => s.wpm))!
  const avgComprehensionLastMonth = average(lastMonth.map((s) => s.comprehensionPercent))!

  const wpmDeltaPercent = avgWpmLastMonth > 0 ? ((avgWpmThisMonth - avgWpmLastMonth) / avgWpmLastMonth) * 100 : 0
  const comprehensionDeltaPoints = avgComprehensionThisMonth - avgComprehensionLastMonth

  if (comprehensionDeltaPoints > 3 && comprehensionDeltaPoints > wpmDeltaPercent / 4) {
    return 'This month your comprehension improved more than your speed.'
  }
  if (wpmDeltaPercent > 5 && wpmDeltaPercent / 4 > comprehensionDeltaPoints) {
    return 'This month your reading speed improved more than your comprehension.'
  }
  if (thisMonth.length > lastMonth.length + 1) {
    return 'Your reading consistency has become much stronger this month.'
  }

  const thisMonthDifficulty = mostFrequentDifficulty(thisMonth)
  const lastMonthDifficulty = mostFrequentDifficulty(lastMonth)
  if (thisMonthDifficulty === 'medium' && lastMonthDifficulty === 'easy' && avgComprehensionThisMonth >= 80) {
    return 'You have grown comfortable with intermediate passages this month.'
  }
  if (thisMonthDifficulty === 'hard' && lastMonthDifficulty !== 'hard' && avgComprehensionThisMonth >= 75) {
    return 'You are now taking on advanced passages with confidence this month.'
  }

  return 'Your reading is holding steady month over month — keep the momentum going.'
}
