import type { AssessmentStageId } from './selectAssessmentPassages'

export type AssessmentStageResult = {
  stage: AssessmentStageId
  wpm: number
  comprehensionPercent: number
}

export type ReadingStyle = 'Deep Comprehension Reader' | 'Natural Chunk Reader' | 'Steady, Consistent Reader' | 'Building Reading Confidence'

const LOW_COMPREHENSION_THRESHOLD = 50
const HIGH_COMPREHENSION_THRESHOLD = 80
// A learner whose paragraph-stage speed is at least 30% faster than
// their word-chunk-stage speed reads naturally faster once given more
// context per screen — the "chunk reader" signal this whole product is
// built around.
const CHUNK_READER_SPEED_RATIO = 1.3

// Reading Assessment Engine™ — Reading Style. A real, disclosed,
// deterministic band over this assessment's own real per-stage
// measurements — never a fabricated psychological profile, never a new
// Claude call. Every label is deliberately encouraging per the brief's
// own UX rule ("the user must never feel judged" — no "Slow Reader" /
// "Weak Reader" anywhere), mirroring the same qualitative-banding
// discipline `resolveReadingConfidence.ts` and the Lab's own
// `weaknessDetectorEngine.ts` already established.
export function resolveReadingStyle(stageResults: readonly AssessmentStageResult[]): ReadingStyle {
  if (stageResults.length === 0) return 'Building Reading Confidence'

  const averageComprehension = average(stageResults.map((result) => result.comprehensionPercent))
  if (averageComprehension < LOW_COMPREHENSION_THRESHOLD) return 'Building Reading Confidence'
  if (averageComprehension >= HIGH_COMPREHENSION_THRESHOLD) return 'Deep Comprehension Reader'

  const wordChunk = stageResults.find((result) => result.stage === 'word-chunk')
  const paragraph = stageResults.find((result) => result.stage === 'paragraph')
  const speedRatio = wordChunk && paragraph && wordChunk.wpm > 0 ? paragraph.wpm / wordChunk.wpm : 1
  if (speedRatio >= CHUNK_READER_SPEED_RATIO) return 'Natural Chunk Reader'

  return 'Steady, Consistent Reader'
}

function average(values: readonly number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}
