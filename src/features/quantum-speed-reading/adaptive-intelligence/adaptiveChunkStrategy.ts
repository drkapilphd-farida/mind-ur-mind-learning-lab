import type { ReadingProfile } from './readingIntelligenceTypes'
import type { ChunkAnalysis } from '@/core/universal-learning-engine/learning-analysis/types/ChunkAnalysis'
import type { ReadingPreferences } from '../readingPreferences'

// Deterministic presentation-only adjustments derived from per-chunk
// `ChunkAnalysis` and the learner's `ReadingProfile`.
// Rules are intentionally conservative and purely presentational.

export type PresentationAdjustment = Partial<ReadingPreferences>

export function computePresentationAdjustment(
  profile: ReadingProfile | null,
  analysis: ChunkAnalysis,
): PresentationAdjustment {
  const adj: PresentationAdjustment = {}

  // Base adjustments driven by expected cognitive load: high load =>
  // narrower reading width, larger line-height, enable focus mode.
  if (analysis.expectedCognitiveLoad >= 0.75) {
    adj.readingWidth = 'narrow'
    adj.lineHeight = 'relaxed'
    adj.focusMode = true
    adj.guide = 'underline'
    adj.fontScale = 1
  }

  // Memory difficulty signals need for stronger visual cues.
  if (analysis.memoryDifficulty >= 0.7) {
    adj.guide = adj.guide === 'underline' ? 'highlight' : 'highlight'
    adj.focusMode = true
    adj.lineHeight = adj.lineHeight ?? 'relaxed'
  }

  // If chunk is simple (low readingComplexity and low knowledge density),
  // present more comfortably (larger font and wider column).
  if (analysis.readingComplexity <= 6 && analysis.knowledgeDensity <= 0.2) {
    adj.fontScale = Math.max(adj.fontScale ?? 1, 1.15)
    adj.readingWidth = adj.readingWidth ?? 'wide'
    adj.lineHeight = adj.lineHeight ?? 'comfortable'
  }

  // Respect learner profile: slower readers get a slightly larger font.
  if (profile && profile.averageWpm > 0 && profile.averageWpm < 220) {
    adj.fontScale = Math.max(adj.fontScale ?? 1, 1.15)
  }

  // Ensure valid defaults are not returned as undefined values.
  return adj
}

export function computePresentationForChunk(
  userId: string | null,
  profile: ReadingProfile | null,
  analysis: ChunkAnalysis,
): PresentationAdjustment {
  // userId is unused in this conservative model, but included so callers
  // can later add per-user overrides without changing the signature.
  return computePresentationAdjustment(profile, analysis)
}
