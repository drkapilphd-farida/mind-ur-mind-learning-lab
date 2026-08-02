import { dedupeValues, hashString, seededShuffle } from './assessmentQuestionUtils'
import type { AssessmentQuestion } from './AssessmentQuestion'
import type { AssessmentPassage } from '../selectAssessmentPassages'

const MAX_OPTIONS = 4

// Reading Assessment Engine™ — Fill in the Blank. "Fill in the blank:
// '<real definition>' describes ___." — the correct answer is the real
// term UCE-3B paired with that definition in this passage's own
// enrichment; distractor terms come from the assessment's other real
// passages' own definitions. The "blank" stays selectable (a term
// picked from options), never free-text entry — mirrors
// `mcqs-mode-runtime`'s existing `definition-to-term` pattern. Returns
// null, honestly, when this passage has no real term/definition pairs.
export function buildFillInTheBlankQuestion(passage: AssessmentPassage, allPassages: readonly AssessmentPassage[]): AssessmentQuestion | null {
  const ownDefinitions = passage.enrichment.definitions ?? []
  if (ownDefinitions.length === 0) return null

  const seed = hashString(`${passage.chunkNodeId}-fill-in-the-blank`)
  const correct = ownDefinitions[seed % ownDefinitions.length]
  if (correct === undefined) return null

  const distractorPool = dedupeValues(
    allPassages
      .filter((other) => other.chunkNodeId !== passage.chunkNodeId)
      .flatMap((other) => (other.enrichment.definitions ?? []).map((definition) => definition.term)),
    correct.term,
  )
  if (distractorPool.length === 0) return null

  const distractors = seededShuffle(distractorPool, seed).slice(0, MAX_OPTIONS - 1)
  const options = [{ value: correct.term, isCorrect: true }, ...distractors.map((value) => ({ value, isCorrect: false }))]

  return { type: 'fill-in-the-blank', prompt: `Fill in the blank: "${correct.definition}" describes ___.`, options: seededShuffle(options, seed + 1) }
}
