// Weekly Insight — Sprint 5, Part 9. One real, deterministic summary
// comparing this week's real sessions against last week's — never a
// generic rotating quote.

import type { ReadingSessionRecord } from '../adaptive-intelligence/readingIntelligenceTypes'
import type { PassageDifficulty } from '../passageDifficulty'

const DAY_MS = 86_400_000

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

export function generateWeeklyInsight(sessions: readonly ReadingSessionRecord[], referenceMs: number = Date.now()): string {
  const completed = sessions.filter((s) => s.completed)
  const thisWeek = completed.filter((s) => daysSince(s.occurredAt, referenceMs) <= 7)
  const lastWeek = completed.filter((s) => {
    const d = daysSince(s.occurredAt, referenceMs)
    return d > 7 && d <= 14
  })

  if (thisWeek.length === 0) {
    return 'No sessions yet this week — complete a reading session to unlock your weekly insight.'
  }

  const avgWpmThisWeek = average(thisWeek.map((s) => s.wpm))!
  const avgComprehensionThisWeek = average(thisWeek.map((s) => s.comprehensionPercent))!

  if (lastWeek.length === 0) {
    return `You've completed ${thisWeek.length} session${thisWeek.length === 1 ? '' : 's'} this week at ${Math.round(avgWpmThisWeek)} WPM and ${Math.round(avgComprehensionThisWeek)}% comprehension — next week we'll compare your progress.`
  }

  const avgWpmLastWeek = average(lastWeek.map((s) => s.wpm))!
  const avgComprehensionLastWeek = average(lastWeek.map((s) => s.comprehensionPercent))!

  const wpmDeltaPercent = avgWpmLastWeek > 0 ? ((avgWpmThisWeek - avgWpmLastWeek) / avgWpmLastWeek) * 100 : 0
  const comprehensionDeltaPoints = avgComprehensionThisWeek - avgComprehensionLastWeek

  if (comprehensionDeltaPoints > 3 && comprehensionDeltaPoints > wpmDeltaPercent / 4) {
    return 'This week your comprehension improved more than your speed.'
  }
  if (wpmDeltaPercent > 5 && wpmDeltaPercent / 4 > comprehensionDeltaPoints) {
    return 'This week your reading speed improved more than your comprehension.'
  }
  if (thisWeek.length > lastWeek.length + 1) {
    return 'Your reading consistency has become much stronger.'
  }

  const thisWeekDifficulty = mostFrequentDifficulty(thisWeek)
  const lastWeekDifficulty = mostFrequentDifficulty(lastWeek)
  if (thisWeekDifficulty === 'medium' && lastWeekDifficulty === 'easy' && avgComprehensionThisWeek >= 80) {
    return 'You are now comfortable with intermediate passages.'
  }
  if (thisWeekDifficulty === 'hard' && lastWeekDifficulty !== 'hard' && avgComprehensionThisWeek >= 75) {
    return 'You are now taking on advanced passages with confidence.'
  }

  return 'Your reading is holding steady week over week — keep the momentum going.'
}
