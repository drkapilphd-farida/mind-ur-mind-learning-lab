// Peripheral Flash™ Recommendation — the AI Brain Coach. Professional,
// scientific, never childish — matching the mission's own examples:
// "Excellent. Today your peripheral awareness expanded. You successfully
// recognized multiple visual targets while maintaining fixation. This
// will directly improve chunk reading and multi-line reading." and, when
// the data genuinely supports it, "Your left peripheral recognition is
// stronger than your right. Continue training to balance both sides."
//
// computeReadingSpeedBenefit is imported (not redefined) from Number
// Flash's recommendation file — identical, pure, mission-agnostic logic;
// Symbol Flash already reused this exact function rather than
// re-duplicating it, and Peripheral Flash follows the same precedent.
// numberFlashRecommendation.ts is read-only here.

import type { DifficultyTier } from '@/types/exercise-engine'
import { peripheralFlashUiLevel, peripheralFlashPaceDescriptor, PERIPHERAL_LEVEL_NAME, type PeripheralTrainingLevel } from './peripheralFlashDifficulty'
import type { PeripheralSide } from './peripheralFlashEngine'
export { computeReadingSpeedBenefit } from './numberFlashRecommendation'

export type PeripheralFlashRecommendation = {
  accuracyMessage: string
  progressMessage: string
  coachParagraph: string
}

export function buildPeripheralFlashRecommendation(input: {
  accuracyPercent: number
  averageVisualSpan: number
  visualSpanGrew: boolean | null // null when there's no prior session to compare
  currentTier: DifficultyTier
  nextTier: DifficultyTier
  nextTrainingLevel: PeripheralTrainingLevel
  promoted: boolean
  recovered: boolean
  weakerSide: PeripheralSide | null
}): PeripheralFlashRecommendation {
  const { accuracyPercent, averageVisualSpan, visualSpanGrew, nextTier, nextTrainingLevel, promoted, recovered, weakerSide } = input

  const accuracyMessage =
    accuracyPercent === 100 ? 'Perfect Awareness — every peripheral target recognized without moving your eyes.'
    : accuracyPercent >= 90 ? 'Elite Performance — peripheral awareness operating at its peak.'
    : accuracyPercent >= 75 ? 'Strong Recognition — visual span expanded this mission.'
    : accuracyPercent >= 60 ? 'Building Awareness — steady gains with every repetition.'
    : 'Calibrating — recognizing targets outside fixation takes a few missions to build.'

  const progressMessage = promoted
    ? `Advancing to ${PERIPHERAL_LEVEL_NAME[nextTrainingLevel]} (${peripheralFlashUiLevel(nextTier)}) — ${peripheralFlashPaceDescriptor(nextTier)} pace. Your visual span is widening.`
    : recovered
      ? `Stepping back to ${PERIPHERAL_LEVEL_NAME[nextTrainingLevel]} (${peripheralFlashUiLevel(nextTier)}) to consolidate peripheral awareness before pushing further.`
      : `Holding steady at ${PERIPHERAL_LEVEL_NAME[nextTrainingLevel]} — consistency is how visual span expands.`

  const opener =
    weakerSide !== null ? null // the side-specific line below opens the paragraph instead
    : accuracyPercent === 100 || visualSpanGrew === true ? 'Excellent.'
    : accuracyPercent >= 85 ? 'Strong session.'
    : accuracyPercent >= 60 ? 'Solid progress.'
    : 'Good effort.'

  const spanLine = averageVisualSpan >= 2
    ? `Today your peripheral awareness expanded — you successfully recognized ${averageVisualSpan} visual targets at once while maintaining fixation.`
    : 'Today your peripheral awareness is building — you are learning to recognize targets outside direct fixation, without moving your eyes.'

  // The single most actionable, specific insight the data can honestly
  // support this session — named only when there's enough single-side
  // data on both sides AND a real gap (findWeakerSide already gates on
  // this; a null weakerSide here just means "not enough evidence yet,"
  // never treated as "balanced").
  const sideLine = weakerSide !== null
    ? `Your ${weakerSide} peripheral recognition is currently ${weakerSide === 'left' ? 'behind your right' : 'behind your left'}. Continue training to balance both sides.`
    : null

  const benefitLine = promoted
    ? `This will directly improve chunk reading and multi-line reading — you are ready for ${PERIPHERAL_LEVEL_NAME[nextTrainingLevel]}.`
    : recovered
      ? 'A short step back now builds the fixation discipline real reading speed depends on.'
      : 'This will directly improve chunk reading and multi-line reading.'

  const coachParagraph = [opener, sideLine, spanLine, benefitLine]
    .filter((sentence): sentence is string => sentence !== null)
    .join(' ')

  return { accuracyMessage, progressMessage, coachParagraph }
}
