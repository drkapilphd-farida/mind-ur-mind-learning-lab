import { dedupeValues, hashString, seededShuffle } from './assessmentQuestionUtils'
import type { AssessmentQuestion } from './AssessmentQuestion'
import type { AssessmentPassage } from '../selectAssessmentPassages'

const MAX_OPTIONS = 4

// Reading Assessment Engine™ — Keyword Identification. "Which of these
// words appeared in what you just read?" — the correct answer is a real
// keyword/important term from this passage's own real, UCE-3B-populated
// enrichment; distractors are real keywords from the assessment's other
// 3 passages (never invented words). Returns null, honestly, when this
// passage has no real keywords to draw from.
export function buildKeywordIdentificationQuestion(passage: AssessmentPassage, allPassages: readonly AssessmentPassage[]): AssessmentQuestion | null {
  const ownKeywords = dedupeValues([...(passage.enrichment.keywords ?? []), ...(passage.enrichment.importantTerms ?? [])])
  if (ownKeywords.length === 0) return null

  const seed = hashString(`${passage.chunkNodeId}-keyword`)
  const correctValue = ownKeywords[seed % ownKeywords.length]
  if (correctValue === undefined) return null

  const distractorPool = dedupeValues(
    allPassages.filter((other) => other.chunkNodeId !== passage.chunkNodeId).flatMap((other) => [...(other.enrichment.keywords ?? []), ...(other.enrichment.importantTerms ?? [])]),
    correctValue,
  )
  if (distractorPool.length === 0) return null

  const distractors = seededShuffle(distractorPool, seed).slice(0, MAX_OPTIONS - 1)
  const options = [{ value: correctValue, isCorrect: true }, ...distractors.map((value) => ({ value, isCorrect: false }))]

  return { type: 'keyword-identification', prompt: 'Which of these words appeared in what you just read?', options: seededShuffle(options, seed + 1) }
}
