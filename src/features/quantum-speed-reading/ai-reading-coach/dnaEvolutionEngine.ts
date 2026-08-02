// Reading DNA™ Evolution — Sprint 5, Part 8. Shows a real trend instead of
// a fixed value by re-running Sprint-4's own computeReadingDna (never
// modified, never re-implemented) over progressively larger historical
// windows — every point on the trend is a real recomputation from that
// point in history, not an interpolated or fabricated value.

import { computeReadingDna } from '../adaptive-intelligence/readingDnaEngine'
import type { ReadingSessionRecord, ReadingDnaDimension } from '../adaptive-intelligence/readingIntelligenceTypes'

export type DnaTrendPoint = { sessionCount: number; confidence: number }
export type DnaEvolutionTrait = { dimension: ReadingDnaDimension; label: string; trend: readonly DnaTrendPoint[] }

const MAX_CHECKPOINTS = 8

function checkpointCounts(totalCount: number): readonly number[] {
  if (totalCount <= MAX_CHECKPOINTS) {
    return Array.from({ length: totalCount }, (_, i) => i + 1)
  }
  // Evenly-spaced checkpoints ending exactly at the full count.
  const step = totalCount / MAX_CHECKPOINTS
  const counts = Array.from({ length: MAX_CHECKPOINTS }, (_, i) => Math.round((i + 1) * step))
  return Array.from(new Set(counts))
}

// `sessions` arrives newest-first (the convention getReadingIntelligenceSessions
// already uses) — reversed here so checkpoint 1 reflects the learner's
// earliest session and later checkpoints accumulate toward "now", the
// correct direction for an "evolution over time" trend.
export function computeDnaEvolution(sessions: readonly ReadingSessionRecord[]): readonly DnaEvolutionTrait[] {
  const chronological = [...sessions].filter((s) => s.completed).reverse()

  if (chronological.length === 0) {
    const emptyTraits = computeReadingDna([])
    return emptyTraits.map((trait) => ({ dimension: trait.dimension, label: trait.label, trend: [] }))
  }

  const counts = checkpointCounts(chronological.length)
  const checkpointTraitsList = counts.map((count) => computeReadingDna(chronological.slice(0, count)))
  const finalTraits = checkpointTraitsList[checkpointTraitsList.length - 1]!

  return finalTraits.map((finalTrait, dimensionIndex) => ({
    dimension: finalTrait.dimension,
    label: finalTrait.label,
    trend: counts.map((count, i) => ({ sessionCount: count, confidence: checkpointTraitsList[i]![dimensionIndex]!.confidence })),
  }))
}
