// Strength Detector — Sprint 5, Part 4. Mostly surfaces Sprint-4's own
// Reading DNA™ traits (read-only reuse of computeReadingDna's output,
// never re-implemented) above a confidence bar, plus a couple of
// session-level strengths not covered by DNA.

import type { ReadingDnaTrait, ReadingSessionRecord } from '../adaptive-intelligence/readingIntelligenceTypes'

export type DetectedStrength = { id: string; label: string }

const CONFIDENCE_BAR = 50

// Only genuinely positive labels per dimension are surfaced as strengths —
// e.g. "Occasionally Distracted" (focus-pattern) or "Prefers Easy"
// (difficulty-comfort) are real DNA labels but not framed as strengths here.
const POSITIVE_LABELS = new Set([
  'Fast Reader', 'Deep Reader', 'Balanced Reader',
  'Visual Dominant', 'Analytical Visual Reader', 'Balanced Visual Reader',
  'Balanced Strategy',
  'Highly Consistent',
  'Thrives on Challenge', 'Comfortable Medium',
])

function average(values: readonly number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

export function detectStrengths(
  dnaTraits: readonly ReadingDnaTrait[],
  recentSessions: readonly ReadingSessionRecord[],
): readonly DetectedStrength[] {
  const strengths: DetectedStrength[] = []

  for (const trait of dnaTraits) {
    if (trait.confidence < CONFIDENCE_BAR) continue
    if (trait.dimension === 'category-preference') {
      strengths.push({ id: `category-${trait.label}`, label: `Strong in ${trait.label}` })
      continue
    }
    if (POSITIVE_LABELS.has(trait.label)) {
      strengths.push({ id: `dna-${trait.dimension}`, label: trait.label })
    }
  }

  if (recentSessions.length > 0) {
    const avgAccuracy = average(recentSessions.map((s) => s.accuracyPercent))
    const avgComprehension = average(recentSessions.map((s) => s.comprehensionPercent))
    if (avgAccuracy >= 90) strengths.push({ id: 'strong-accuracy', label: 'Strong Accuracy' })
    if (avgComprehension >= 90) strengths.push({ id: 'excellent-comprehension', label: 'Excellent Comprehension' })
  }

  return strengths
}
