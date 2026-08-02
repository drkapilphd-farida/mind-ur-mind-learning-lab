// Reading DNA™ — Sprint 4 of Quantum Speed Reading™. Every dimension is
// recomputed fresh from the FULL session history each time this is called —
// there is no stored/mutated "permanent label." Confidence starts low with
// a single session and grows with more evidence, capped below 100% (never
// fully certain from a finite sample) — never presented as a fixed verdict.

import { estimateWpm } from '../passageDifficulty'
import { computeSpeedScore } from '../comprehensionEngine'
import type { PassageCategory } from '../passageLibrary'
import type { PassageDifficulty } from '../passageDifficulty'
import type { ReadingSessionRecord, ReadingDnaTrait } from './readingIntelligenceTypes'

// Confidence grows with evidence (session count) but is capped below full
// certainty — one session never earns more than a modest confidence score.
export function computeConfidence(relevantSessionCount: number): number {
  if (relevantSessionCount <= 0) return 0
  return Math.round(Math.min(95, 20 + relevantSessionCount * 8))
}

function average(values: readonly number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

function standardDeviation(values: readonly number[]): number {
  if (values.length < 2) return 0
  const mean = average(values)
  const variance = average(values.map((v) => (v - mean) ** 2))
  return Math.sqrt(variance)
}

function mostFrequent<T>(values: readonly T[]): T | null {
  if (values.length === 0) return null
  const counts = new Map<T, number>()
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1)
  let best: T | null = null
  let bestCount = -1
  for (const [value, count] of counts) {
    if (count > bestCount) {
      best = value
      bestCount = count
    }
  }
  return best
}

function computeReadingStyle(sessions: readonly ReadingSessionRecord[]): ReadingDnaTrait {
  const avgWpm = average(sessions.map((s) => s.wpm))
  const label = avgWpm >= 260 ? 'Fast Reader' : avgWpm <= 160 ? 'Deep Reader' : 'Balanced Reader'
  return { dimension: 'reading-style', label, confidence: computeConfidence(sessions.length) }
}

// No eye-tracking exists (explicitly out of scope) — this is a derived
// interpretation from real speed + accuracy signals, not a fabricated
// measurement: consistently fast AND accurate suggests efficient visual
// processing; slower-but-accurate suggests a more analytical approach.
function computeVisualProcessing(sessions: readonly ReadingSessionRecord[]): ReadingDnaTrait {
  const avgWpm = average(sessions.map((s) => s.wpm))
  const avgAccuracy = average(sessions.map((s) => s.accuracyPercent))
  let label: string
  if (avgWpm >= 240 && avgAccuracy >= 80) label = 'Visual Dominant'
  else if (avgWpm < 200 && avgAccuracy >= 80) label = 'Analytical Visual Reader'
  else label = 'Balanced Visual Reader'
  return { dimension: 'visual-processing', label, confidence: computeConfidence(sessions.length) }
}

function computeReadingStrategy(sessions: readonly ReadingSessionRecord[]): ReadingDnaTrait {
  const speedScores = sessions.map((s) => computeSpeedScore(s.wpm, estimateWpm(s.difficulty)))
  const avgSpeedScore = average(speedScores)
  const avgAccuracy = average(sessions.map((s) => s.accuracyPercent))
  const gap = avgSpeedScore - avgAccuracy
  const label = gap > 12 ? 'Speed-first' : gap < -12 ? 'Comprehension-first' : 'Balanced Strategy'
  return { dimension: 'reading-strategy', label, confidence: computeConfidence(sessions.length) }
}

function computeFocusPattern(sessions: readonly ReadingSessionRecord[]): ReadingDnaTrait {
  const stdDev = standardDeviation(sessions.map((s) => s.accuracyPercent))
  const label = stdDev <= 8 ? 'Highly Consistent' : stdDev <= 18 ? 'Occasionally Distracted' : 'Needs Focus Training'
  return { dimension: 'focus-pattern', label, confidence: computeConfidence(sessions.length) }
}

const DIFFICULTY_LABEL: Record<PassageDifficulty, string> = {
  easy: 'Prefers Easy',
  medium: 'Comfortable Medium',
  hard: 'Thrives on Challenge',
}

function computeDifficultyComfort(sessions: readonly ReadingSessionRecord[]): ReadingDnaTrait {
  const dominant = mostFrequent(sessions.map((s) => s.difficulty)) ?? 'easy'
  return { dimension: 'difficulty-comfort', label: DIFFICULTY_LABEL[dominant], confidence: computeConfidence(sessions.length) }
}

function computeCategoryPreference(sessions: readonly ReadingSessionRecord[]): ReadingDnaTrait {
  const dominant = mostFrequent(sessions.map((s) => s.category))
  if (!dominant) return { dimension: 'category-preference', label: 'Not enough data yet', confidence: 0 }
  const relevantCount = sessions.filter((s) => s.category === dominant).length
  return { dimension: 'category-preference', label: categoryLabel(dominant), confidence: computeConfidence(relevantCount) }
}

const CATEGORY_LABEL: Record<PassageCategory, string> = {
  science: 'Science',
  history: 'History',
  psychology: 'Psychology',
  biography: 'Biography',
  business: 'Business',
  technology: 'Technology',
  motivation: 'Motivation',
  'general-knowledge': 'General Knowledge',
}

function categoryLabel(category: PassageCategory): string {
  return CATEGORY_LABEL[category]
}

export function computeReadingDna(sessions: readonly ReadingSessionRecord[]): readonly ReadingDnaTrait[] {
  const completed = sessions.filter((s) => s.completed)
  if (completed.length === 0) {
    return ['reading-style', 'visual-processing', 'reading-strategy', 'focus-pattern', 'difficulty-comfort', 'category-preference'].map(
      (dimension) => ({ dimension: dimension as ReadingDnaTrait['dimension'], label: 'Not enough data yet', confidence: 0 }),
    )
  }

  return [
    computeReadingStyle(completed),
    computeVisualProcessing(completed),
    computeReadingStrategy(completed),
    computeFocusPattern(completed),
    computeDifficultyComfort(completed),
    computeCategoryPreference(completed),
  ]
}
