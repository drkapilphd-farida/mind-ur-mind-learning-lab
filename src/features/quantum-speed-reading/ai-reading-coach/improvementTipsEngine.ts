// AI Improvement Tips — Sprint 5, Part 2. Each tip only appears when the
// real underlying threshold is actually met — never a generic rotating
// list.

import { estimateWpm } from '../passageDifficulty'
import type { ReadingSessionRecord } from '../adaptive-intelligence/readingIntelligenceTypes'

function average(values: readonly number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

function standardDeviation(values: readonly number[]): number {
  if (values.length < 2) return 0
  const mean = average(values)
  return Math.sqrt(average(values.map((v) => (v - mean) ** 2)))
}

export function generateImprovementTips(
  latest: ReadingSessionRecord,
  recentSessions: readonly ReadingSessionRecord[],
): readonly string[] {
  const tips: string[] = []
  const targetWpm = estimateWpm(latest.difficulty)

  if (latest.wpm < targetWpm * 0.8) {
    tips.push('Practice phrase grouping — reading in small meaningful chunks builds speed naturally.')
  }
  if (latest.comprehensionPercent < 70) {
    tips.push('Reduce speed slightly on your next passage to protect comprehension.')
  }
  if (latest.accuracyPercent < 70) {
    tips.push('Pay close attention to transition sentences — they often signal a shift in meaning.')
  }

  const recentReadingTimes = [...recentSessions, latest].map((s) => s.readingTimeMs)
  if (recentReadingTimes.length >= 3) {
    const mean = average(recentReadingTimes)
    const coefficientOfVariation = mean > 0 ? standardDeviation(recentReadingTimes) / mean : 0
    if (coefficientOfVariation > 0.35) {
      tips.push('Your reading time has varied a lot session to session — avoid rushing during the first paragraph to build a steadier pace.')
    }
  }

  return tips
}
