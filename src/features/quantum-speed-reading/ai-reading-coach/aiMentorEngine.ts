// AI Mentor™ — Sprint 5, Part 10. One natural, professional two-sentence
// observation, deterministically composed from the real strength/weakness
// signals already computed elsewhere in this sprint — the same
// "recommendation engine" pattern used everywhere in this app, not a live
// LLM call.

import { PASSAGE_CATEGORY_LABEL } from '../passageDifficulty'
import type { ReadingSessionRecord } from '../adaptive-intelligence/readingIntelligenceTypes'
import type { DetectedStrength } from './strengthDetectorEngine'
import type { DetectedWeakness } from './weaknessDetectorEngine'

function buildOpeningSentence(latest: ReadingSessionRecord, strengths: readonly DetectedStrength[]): string {
  const labels = strengths.map((s) => s.label)
  if (labels.includes('Balanced Reader') || labels.includes('Balanced Strategy')) {
    return 'You have developed a strong balance between speed and understanding.'
  }
  if (labels.includes('Fast Reader')) return "You've developed real speed as a reader."
  if (labels.includes('Deep Reader')) return 'You read carefully and thoroughly, prioritizing understanding over pace.'
  if (labels.includes('Highly Consistent')) return 'Your focus has been highly consistent across recent sessions.'
  if (strengths.length > 0) return `You're showing real strength as a ${strengths[0]!.label.toLowerCase()}.`
  return `You completed a ${latest.difficulty} passage in ${PASSAGE_CATEGORY_LABEL[latest.category]}.`
}

function buildClosingSentence(latest: ReadingSessionRecord, weaknesses: readonly DetectedWeakness[]): string {
  const categoryLabel = PASSAGE_CATEGORY_LABEL[latest.category].toLowerCase()
  const ids = weaknesses.map((w) => w.id)

  if (ids.includes('reading-too-fast') || ids.includes('high-speed-low-accuracy')) {
    return `For even better performance, practice slightly slower during difficult ${categoryLabel} passages.`
  }
  if (ids.includes('reading-too-slow')) {
    return `Try pushing your pace a little on your next ${categoryLabel} passage — your comprehension can support it.`
  }
  if (ids.includes('declining-accuracy')) {
    return 'Slow down slightly over your next few sessions to rebuild consistency.'
  }
  if (ids.includes('inconsistent-pacing')) {
    return 'Aim for a steadier pace from the very first paragraph next time.'
  }
  return 'Keep practicing at this level to build even more confidence.'
}

export function generateAiMentorObservation(
  latest: ReadingSessionRecord,
  strengths: readonly DetectedStrength[],
  weaknesses: readonly DetectedWeakness[],
): string {
  return `${buildOpeningSentence(latest, strengths)} ${buildClosingSentence(latest, weaknesses)}`
}
