// Weakness Detector — Sprint 5, Part 3. Session-level patterns only (per
// the resolved scope decision — no per-question-type data is persisted,
// so "difficulty with inference questions"-style insights are not
// fabricated here).

import { estimateWpm } from '../passageDifficulty'
import type { ReadingSessionRecord } from '../adaptive-intelligence/readingIntelligenceTypes'

export type WeaknessId = 'reading-too-fast' | 'reading-too-slow' | 'high-speed-low-accuracy' | 'inconsistent-pacing' | 'declining-accuracy'

export type DetectedWeakness = { id: WeaknessId; label: string; description: string }

function average(values: readonly number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

function standardDeviation(values: readonly number[]): number {
  if (values.length < 2) return 0
  const mean = average(values)
  return Math.sqrt(average(values.map((v) => (v - mean) ** 2)))
}

export function detectWeaknesses(
  latest: ReadingSessionRecord,
  recentSessions: readonly ReadingSessionRecord[],
): readonly DetectedWeakness[] {
  const weaknesses: DetectedWeakness[] = []
  const targetWpm = estimateWpm(latest.difficulty)

  if (latest.wpm >= targetWpm * 1.3 && latest.comprehensionPercent < 75) {
    weaknesses.push({ id: 'reading-too-fast', label: 'Reading Too Quickly', description: 'Your pace is outrunning your comprehension on recent passages.' })
  }
  if (latest.wpm <= targetWpm * 0.7 && latest.comprehensionPercent >= 85) {
    weaknesses.push({ id: 'reading-too-slow', label: 'Reading Too Slowly', description: 'Your comprehension is strong enough to support a faster pace.' })
  }
  if (latest.wpm >= targetWpm && latest.accuracyPercent < 70) {
    weaknesses.push({ id: 'high-speed-low-accuracy', label: 'High Speed, Low Accuracy', description: 'Fast reading is coming at the cost of correct answers.' })
  }

  const combined = [...recentSessions, latest]
  if (combined.length >= 3) {
    const readingTimes = combined.map((s) => s.readingTimeMs)
    const mean = average(readingTimes)
    const coefficientOfVariation = mean > 0 ? standardDeviation(readingTimes) / mean : 0
    if (coefficientOfVariation > 0.35) {
      weaknesses.push({ id: 'inconsistent-pacing', label: 'Inconsistent Pacing', description: 'Your reading time varies a lot session to session.' })
    }

    const accuracies = combined.map((s) => s.accuracyPercent)
    const firstHalf = average(accuracies.slice(0, Math.floor(accuracies.length / 2)))
    const secondHalf = average(accuracies.slice(Math.floor(accuracies.length / 2)))
    if (secondHalf < firstHalf - 10) {
      weaknesses.push({ id: 'declining-accuracy', label: 'Declining Accuracy', description: 'Your accuracy has trended down across your last few sessions.' })
    }
  }

  return weaknesses
}
