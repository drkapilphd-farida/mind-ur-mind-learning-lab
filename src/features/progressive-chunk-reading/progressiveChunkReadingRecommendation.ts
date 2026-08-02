// Progressive Chunk Reading™ Recommendation — the AI Brain Coach. Two
// distinct moments: a one-sentence block-level note (after each block's 2
// questions, keeping the learner in flow rather than breaking into a full
// result screen every block) and the full mission-level paragraph shown at
// Mission Complete. Both follow the same professional, scientific,
// encouraging tone already locked for the Flash Intelligence Pack™, and
// the same "never claim a false win" discipline established there (a
// learner pushed faster who stopped comprehending is told so plainly, not
// congratulated by default).
//
// Coaching lines are randomized (pool + seed) rather than fixed, per the
// UX polish brief — the same real outcome (perfect / partial / struggling
// block) can be described several different, equally honest ways so
// recognition doesn't feel like the same rote message every time.

import { pickItems } from '@/lib/exercise-engine/randomizationEngine'
import type { ReadingRhythm } from './progressiveChunkReadingEngine'
export { computeReadingReadiness } from '../flash-intelligence/wordFlashInsights'

const PERFECT_BLOCK_MESSAGES = [
  'Comprehension held steady through this block.',
  'Excellent visual grouping — every chunk landed.',
  'Your eyes are beginning to capture multiple words together.',
  'Chunk recognition becoming automatic.',
] as const

const PARTIAL_BLOCK_MESSAGES = [
  'Comprehension mostly held — one detail slipped past.',
  'Visual span increasing, with a little more consistency to build.',
  'Reading rhythm improving — one recognition slipped past.',
] as const

const STRUGGLING_BLOCK_MESSAGES = [
  'Pace outran comprehension this block — worth a slightly slower read next time.',
  'Peripheral processing is still catching up to this pace.',
  'Comprehension needs a steadier pace to keep up here.',
] as const

export function buildProgressiveChunkReadingBlockMessage(correctInBlock: number, totalInBlock: number, seed: number): string {
  if (totalInBlock === 0) return ''
  const ratio = correctInBlock / totalInBlock
  const pool = ratio === 1 ? PERFECT_BLOCK_MESSAGES : ratio >= 0.5 ? PARTIAL_BLOCK_MESSAGES : STRUGGLING_BLOCK_MESSAGES
  return pickItems([...pool], 1, seed)[0] ?? pool[0]
}

// ── Level HUD / recap labels — pure, derived from real accuracy signals ──

export type RecognitionLabel = 'Excellent' | 'Very Good' | 'Good' | 'Developing'

// Recognition — a direct read of raw block/session accuracy, used on the
// Level Complete recap.
export function computeRecognitionLabel(accuracyPercent: number): RecognitionLabel {
  if (accuracyPercent >= 95) return 'Excellent'
  if (accuracyPercent >= 85) return 'Very Good'
  if (accuracyPercent >= 70) return 'Good'
  return 'Developing'
}

// Brain Performance — blends accuracy with reading rhythm (did pace hold
// or increase alongside comprehension), so it reads as a distinct signal
// from Recognition rather than a duplicate of the same number in
// different words.
export function computeBrainPerformanceLabel(accuracyPercent: number, readingRhythm: ReadingRhythm): RecognitionLabel {
  const bonus = readingRhythm === 'Accelerating' ? 8 : readingRhythm === 'Building' ? -8 : 0
  return computeRecognitionLabel(Math.max(0, Math.min(100, accuracyPercent + bonus)))
}

export type BrainFocusLabel = 'Excellent' | 'Good' | 'Warming Up'

// Brain Focus — the persistent Level HUD's live signal, derived from the
// learner's most recent completed blocks this session (not the whole
// session average) so it reflects current, in-the-moment consistency the
// way a HUD should, not a lagging session-wide figure.
export function computeBrainFocusLabel(recentBlockAccuracies: readonly number[]): BrainFocusLabel {
  if (recentBlockAccuracies.length === 0) return 'Warming Up'
  const recent = recentBlockAccuracies.slice(-3)
  const average = recent.reduce((sum, a) => sum + a, 0) / recent.length
  if (average >= 90) return 'Excellent'
  if (average >= 70) return 'Good'
  return 'Warming Up'
}

// Today's Achievement — the single most relevant, honest highlight from
// this session, prioritized: a genuine level-up beats a fast-but-steady
// rhythm, which beats simple completion. Never invents an achievement
// that didn't happen.
export function computeTodaysAchievement(input: { leveledUpThisSession: boolean; readingRhythm: ReadingRhythm }): string {
  if (input.leveledUpThisSession) return 'Visual Span Increased'
  if (input.readingRhythm === 'Accelerating') return 'Reading Rhythm Improved'
  if (input.readingRhythm === 'Stable') return 'Chunk Recognition Strengthened'
  return 'Session Completed'
}

export type ProgressiveChunkReadingRecommendation = {
  coachParagraph: string
}

// Level Complete / Try Again — one-sentence "what your brain just learned"
// line, same 3-tier shape as sentenceRecommendation.ts's computeLevelCoachLine.
export function computeLevelCoachLine(accuracyPercent: number): string {
  if (accuracyPercent >= 90) return 'Excellent Chunk Recognition.'
  if (accuracyPercent >= 70) return 'Your eyes are grouping words together well.'
  return 'Focus on grouping words instead of reading one at a time.'
}

const INSIGHT_LINES: Record<ReadingRhythm, readonly string[]> = {
  Accelerating: [
    'Visual span increased this session.',
    'Peripheral processing becoming faster.',
    'Your reading rhythm is genuinely improving.',
  ],
  Stable: [
    'Chunk recognition becoming automatic.',
    'Your eyes are capturing multiple words together consistently.',
    'Reading rhythm holding steady at this pace.',
  ],
  Building: [
    'Peripheral processing is still catching up to this pace.',
    'Visual grouping is forming — consistency will follow with practice.',
    'Comprehension is the priority before pace increases further.',
  ],
}

export function buildProgressiveChunkReadingRecommendation(input: {
  accuracyPercent: number
  readingRhythm: ReadingRhythm
  chunkDescriptor: string       // e.g. "3-word chunks" or "natural phrases"
  nextChunkDescriptor: string   // what the next level (or same level, if holding) reads like
  promoted: boolean
  recovered: boolean
  seed: number
}): ProgressiveChunkReadingRecommendation {
  const { readingRhythm, chunkDescriptor, nextChunkDescriptor, promoted, recovered, seed } = input

  const opener =
    readingRhythm === 'Accelerating' ? 'Excellent.'
    : readingRhythm === 'Stable' ? 'Strong session.'
    : 'Good effort.'

  const demonstrated = readingRhythm === 'Building'
    ? `You are still building comprehension at ${chunkDescriptor}.`
    : `You comfortably processed ${chunkDescriptor}.`

  const insight = pickItems([...INSIGHT_LINES[readingRhythm]], 1, seed)[0] ?? INSIGHT_LINES[readingRhythm][0]

  const forward = promoted
    ? `You are ready for ${nextChunkDescriptor}.`
    : recovered
      ? `Stepping back to ${nextChunkDescriptor} will rebuild a steadier foundation.`
      : `Consolidating at ${chunkDescriptor} a little longer will build a sturdier foundation before advancing.`

  const coachParagraph = `${opener} ${demonstrated} ${insight} ${forward}`

  return { coachParagraph }
}
