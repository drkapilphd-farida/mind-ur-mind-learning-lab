// Sentence Reading™ Recommendation — the AI Brain Coach. Same
// opener+demonstrated+insight+forward paragraph shape Phrase Reading's
// coach uses (see phraseRecommendation.ts), kept as its own
// self-contained file — every mission in this pack keeps its coach copy
// independent, never shared — with every line locked to this mission's
// own register: "idea recognition," "complete thoughts," "idea
// processing." Never Phrase Reading's vocabulary ("meaning recognition,"
// "language processing") — that distinction is exactly what keeps the
// two missions from blurring together at Mission Complete, the same way
// it's kept apart everywhere else in the experience.

import { pickItems } from '@/lib/exercise-engine/randomizationEngine'

export type IdeaProcessingRhythm = 'Accelerating' | 'Stable' | 'Building'

export function computeIdeaProcessingRhythm(
  accuracyPercent: number,
  requiredPercent: number,
  leveledUpThisSession: boolean,
): IdeaProcessingRhythm {
  if (accuracyPercent < requiredPercent) return 'Building'
  return leveledUpThisSession ? 'Accelerating' : 'Stable'
}

export type BrainPerformanceLabel = 'Excellent' | 'Very Good' | 'Good' | 'Developing'

export function computeBrainPerformanceLabel(accuracyPercent: number): BrainPerformanceLabel {
  if (accuracyPercent >= 95) return 'Excellent'
  if (accuracyPercent >= 85) return 'Very Good'
  if (accuracyPercent >= 70) return 'Good'
  return 'Developing'
}

// The per-level AI Coach line — shown directly on the Pass/Fail screen
// after every chapter attempt (distinct from the fuller Result Screen
// paragraph below, which only appears once at Mission Complete). Exact
// three tiers from the locked spec; never "Wrong"/"Bad"/"Incorrect."
export function computeLevelCoachLine(accuracyPercent: number): string {
  if (accuracyPercent >= 90) return 'Excellent Idea Recognition.'
  if (accuracyPercent >= 70) return 'You understand concepts quickly.'
  return 'Focus on identifying the main idea faster.'
}

// Theme Mastery — Result Screen field. Names the theme of the highest
// level actually PASSED this session; if nothing has been passed yet,
// names the current (in-progress) theme instead. Never claims mastery
// that didn't happen.
export function computeThemeMastery(themeName: string, hasPassedAnyLevelThisSession: boolean): string {
  return hasPassedAnyLevelThisSession ? `${themeName} Mastered` : `${themeName} In Progress`
}

// Today's Achievement — the single most relevant, honest highlight from
// this session. Never invents an achievement that didn't happen.
export function computeTodaysAchievement(input: { leveledUpThisSession: boolean; rhythm: IdeaProcessingRhythm }): string {
  if (input.leveledUpThisSession) return 'Idea Processing Improved'
  if (input.rhythm === 'Accelerating') return 'Idea Recognition Becoming Automatic'
  if (input.rhythm === 'Stable') return 'Comprehension Speed Increased'
  return 'Session Completed'
}

export type SentenceReadingRecommendation = {
  coachParagraph: string
}

const INSIGHT_LINES: Record<IdeaProcessingRhythm, readonly string[]> = {
  Accelerating: [
    'Idea recognition is becoming automatic.',
    'Complete thoughts are landing in a single glance.',
    'Idea processing speed increased this session.',
  ],
  Stable: [
    'Idea processing is holding steady at this pace.',
    'You are consistently grasping the complete thought, not just isolated words.',
    'Comprehension is staying reliable as sentences grow longer.',
  ],
  Building: [
    'Full-idea recall is still catching up to this sentence length.',
    'Idea recognition is forming — consistency will follow with practice.',
    'Holding the complete thought in mind is the priority before length increases further.',
  ],
}

export function buildSentenceReadingRecommendation(input: {
  accuracyPercent: number
  rhythm: IdeaProcessingRhythm
  sentenceDescriptor: string     // e.g. "short, direct sentences" or "full-length sentences"
  nextSentenceDescriptor: string // what the next level (or same level, if holding) reads like
  promoted: boolean
  recovered: boolean
  seed: number
}): SentenceReadingRecommendation {
  const { rhythm, sentenceDescriptor, nextSentenceDescriptor, promoted, recovered, seed } = input

  const opener =
    rhythm === 'Accelerating' ? 'Excellent.'
    : rhythm === 'Stable' ? 'Strong session.'
    : 'Good effort.'

  const demonstrated = rhythm === 'Building'
    ? `You are still building complete-idea recall at ${sentenceDescriptor}.`
    : `You comfortably recognised the complete idea in ${sentenceDescriptor}.`

  const insight = pickItems([...INSIGHT_LINES[rhythm]], 1, seed)[0] ?? INSIGHT_LINES[rhythm][0]

  const forward = promoted
    ? `You are ready for ${nextSentenceDescriptor}.`
    : recovered
      ? `Stepping back to ${nextSentenceDescriptor} will rebuild a steadier foundation.`
      : `Consolidating at ${sentenceDescriptor} a little longer will build a sturdier foundation before advancing.`

  const coachParagraph = `${opener} ${demonstrated} ${insight} ${forward}`

  return { coachParagraph }
}
