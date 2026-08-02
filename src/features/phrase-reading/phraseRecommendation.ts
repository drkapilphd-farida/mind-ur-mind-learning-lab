// Phrase Reading™ Recommendation — the AI Brain Coach. Same
// opener+demonstrated+insight+forward paragraph shape PCR's coach uses,
// with every line swapped to the brief's Meaning Recognition register —
// this mission is never described in Chunk Reading's visual-grouping
// language ("chunk recognition," "visual span"); it's always meaning,
// language processing, and ideas.

import { pickItems } from '@/lib/exercise-engine/randomizationEngine'
import type { PhraseReadingRhythm } from './phraseEngine'
export { computeReadingReadiness } from '../flash-intelligence/wordFlashInsights'

export type MeaningRecognitionLabel = 'Excellent' | 'Very Good' | 'Good' | 'Developing'

export function computeMeaningRecognitionLabel(accuracyPercent: number): MeaningRecognitionLabel {
  if (accuracyPercent >= 95) return 'Excellent'
  if (accuracyPercent >= 85) return 'Very Good'
  if (accuracyPercent >= 70) return 'Good'
  return 'Developing'
}

// Language Processing — a distinct Mission Complete signal from Reading
// Fluency: Fluency reflects the PASSIVE reading pace trend (Practice,
// vs. last session); Language Processing reflects ACTIVE comprehension
// speed — how quickly the learner correctly resolved a Brain Challenge,
// derived from real measured reaction time, never a guess. Thresholds are
// a reasonable starting point, not derived from prior data — flagged as
// tunable once real session telemetry exists.
export type LanguageProcessingLabel = 'Excellent' | 'Fast' | 'Developing'

export function computeLanguageProcessingLabel(averageReactionTimeMs: number): LanguageProcessingLabel {
  if (averageReactionTimeMs <= 2500) return 'Excellent'
  if (averageReactionTimeMs <= 4000) return 'Fast'
  return 'Developing'
}

// Today's Achievement — the single most relevant, honest highlight from
// this session. Never invents an achievement that didn't happen.
export function computeTodaysAchievement(input: { leveledUpThisSession: boolean; readingRhythm: PhraseReadingRhythm }): string {
  if (input.leveledUpThisSession) return 'Meaning Recognition Improved'
  if (input.readingRhythm === 'Accelerating') return 'Language Processing Faster'
  if (input.readingRhythm === 'Stable') return 'Reading Fluency Improved'
  return 'Session Completed'
}

export type PhraseReadingRecommendation = {
  coachParagraph: string
}

// Level Complete / Try Again — one-sentence "what your brain just learned"
// line, same 3-tier shape as sentenceRecommendation.ts's computeLevelCoachLine.
export function computeLevelCoachLine(accuracyPercent: number): string {
  if (accuracyPercent >= 90) return 'Excellent Meaning Recognition.'
  if (accuracyPercent >= 70) return 'You recognise ideas quickly.'
  return 'Focus on recognising the whole idea, not each word.'
}

const INSIGHT_LINES: Record<PhraseReadingRhythm, readonly string[]> = {
  Accelerating: [
    'Language processing is becoming faster.',
    'Reading fluency increased this session.',
    'Idea recognition is becoming automatic.',
  ],
  Stable: [
    'Meaning recognition is holding steady.',
    'You are consistently registering the exact idea, not just the topic.',
    'Reading rhythm holding steady at this pace.',
  ],
  Building: [
    'Precision is still catching up to this pace.',
    'Meaning recognition is forming — consistency will follow with practice.',
    'Comprehension of the exact wording is the priority before pace increases further.',
  ],
}

export function buildPhraseReadingRecommendation(input: {
  accuracyPercent: number
  readingRhythm: PhraseReadingRhythm
  phraseDescriptor: string     // e.g. "learning phrases" or "natural sentences"
  nextPhraseDescriptor: string // what the next level (or same level, if holding) reads like
  promoted: boolean
  recovered: boolean
  seed: number
}): PhraseReadingRecommendation {
  const { readingRhythm, phraseDescriptor, nextPhraseDescriptor, promoted, recovered, seed } = input

  const opener =
    readingRhythm === 'Accelerating' ? 'Excellent.'
    : readingRhythm === 'Stable' ? 'Strong session.'
    : 'Good effort.'

  const demonstrated = readingRhythm === 'Building'
    ? `You are still building exact-meaning recognition at ${phraseDescriptor}.`
    : `You comfortably recognised the exact meaning of ${phraseDescriptor}.`

  const insight = pickItems([...INSIGHT_LINES[readingRhythm]], 1, seed)[0] ?? INSIGHT_LINES[readingRhythm][0]

  const forward = promoted
    ? `You are ready for ${nextPhraseDescriptor}.`
    : recovered
      ? `Stepping back to ${nextPhraseDescriptor} will rebuild a steadier foundation.`
      : `Consolidating at ${phraseDescriptor} a little longer will build a sturdier foundation before advancing.`

  const coachParagraph = `${opener} ${demonstrated} ${insight} ${forward}`

  return { coachParagraph }
}
