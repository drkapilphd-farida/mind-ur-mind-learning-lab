// Paragraph Reading™ Recommendation — the AI Brain Coach. Own
// self-contained register: "meaning block," "whole-paragraph
// understanding," "central idea" — never Sentence Reading's vocabulary
// ("idea recognition," "idea processing") or Phrase Reading's ("meaning
// recognition," "language processing"). This distinction keeps every
// mission's Mission Complete screen feeling like its own distinct
// cognitive stage rather than a reskin of a prior one.

import { pickItems } from '@/lib/exercise-engine/randomizationEngine'

export type MeaningBlockRhythm = 'Accelerating' | 'Stable' | 'Building'

export function computeMeaningBlockRhythm(
  accuracyPercent: number,
  requiredPercent: number,
  leveledUpThisSession: boolean,
): MeaningBlockRhythm {
  if (accuracyPercent < requiredPercent) return 'Building'
  return leveledUpThisSession ? 'Accelerating' : 'Stable'
}

// Meaning Recognition — the brief's exact Mission Complete label, derived
// from the Comprehension metric (a stricter, weighted number than raw
// Accuracy — see paragraphEngine.ts's computeComprehensionPercent).
// 3-tier per the brief's own spelled-out example ("Meaning Recognition
// Excellent"), thresholds set below computeBrainPerformanceLabel's 4-tier
// scale since Comprehension is already the stricter number.
export type MeaningRecognitionLabel = 'Excellent' | 'Good' | 'Developing'

export function computeMeaningRecognitionLabel(comprehensionPercent: number): MeaningRecognitionLabel {
  if (comprehensionPercent >= 90) return 'Excellent'
  if (comprehensionPercent >= 75) return 'Good'
  return 'Developing'
}

// The per-mission AI Coach line — shown directly on the Pass/Fail screen
// after every mission attempt. Never "Wrong"/"Bad"/"Incorrect."
export function computeMissionCoachLine(accuracyPercent: number): string {
  if (accuracyPercent >= 90) return 'Excellent Meaning Block Recognition.'
  if (accuracyPercent >= 70) return 'You are grasping the whole idea, not just isolated details.'
  return 'Focus on the paragraph’s central idea before its details.'
}

// Topic Mastery — Result Screen field. Names the topic of the highest
// mission actually PASSED this session; if nothing has been passed yet,
// names the current (in-progress) topic instead. Never claims mastery
// that didn't happen.
export function computeTopicMastery(topicName: string, hasPassedAnyMissionThisSession: boolean): string {
  return hasPassedAnyMissionThisSession ? `${topicName} Mastered` : `${topicName} In Progress`
}

// Today's Achievement — the single most relevant, honest highlight from
// this session. Never invents an achievement that didn't happen.
export function computeTodaysAchievement(input: { leveledUpThisSession: boolean; rhythm: MeaningBlockRhythm }): string {
  if (input.leveledUpThisSession) return 'Meaning Block Recognition Improved'
  if (input.rhythm === 'Accelerating') return 'Whole-Paragraph Understanding Becoming Automatic'
  if (input.rhythm === 'Stable') return 'Comprehension Speed Increased'
  return 'Session Completed'
}

export type ParagraphReadingRecommendation = {
  coachParagraph: string
}

const INSIGHT_LINES: Record<MeaningBlockRhythm, readonly string[]> = {
  Accelerating: [
    'Whole-paragraph understanding is becoming automatic.',
    'You are grasping the central idea in a single pass.',
    'Meaning block recognition speed increased this session.',
  ],
  Stable: [
    'Comprehension is holding steady at this paragraph length.',
    'You are consistently grasping the whole meaning block, not just isolated sentences.',
    'Understanding is staying reliable as paragraphs grow longer.',
  ],
  Building: [
    'Whole-paragraph recall is still catching up to this length.',
    'Meaning block recognition is forming — consistency will follow with practice.',
    'Holding the central idea in mind is the priority before length increases further.',
  ],
}

export function buildParagraphReadingRecommendation(input: {
  accuracyPercent: number
  rhythm: MeaningBlockRhythm
  paragraphDescriptor: string     // e.g. "short, single-idea paragraphs" or "full-length paragraphs"
  nextParagraphDescriptor: string // what the next mission (or same mission, if holding) reads like
  promoted: boolean
  recovered: boolean
  seed: number
}): ParagraphReadingRecommendation {
  const { rhythm, paragraphDescriptor, nextParagraphDescriptor, promoted, recovered, seed } = input

  const opener =
    rhythm === 'Accelerating' ? 'Excellent.'
    : rhythm === 'Stable' ? 'Strong session.'
    : 'Good effort.'

  const demonstrated = rhythm === 'Building'
    ? `You are still building whole-paragraph recall at ${paragraphDescriptor}.`
    : `You comfortably recognised the central idea across ${paragraphDescriptor}.`

  const insight = pickItems([...INSIGHT_LINES[rhythm]], 1, seed)[0] ?? INSIGHT_LINES[rhythm][0]

  const forward = promoted
    ? `You are ready for ${nextParagraphDescriptor}.`
    : recovered
      ? `Stepping back to ${nextParagraphDescriptor} will rebuild a steadier foundation.`
      : `Consolidating at ${paragraphDescriptor} a little longer will build a sturdier foundation before advancing.`

  const coachParagraph = `${opener} ${demonstrated} ${insight} ${forward}`

  return { coachParagraph }
}
