import { dedupeValues, hashString, normalize } from './assessmentQuestionUtils'
import type { AssessmentQuestion } from './AssessmentQuestion'
import type { AssessmentPassage } from '../selectAssessmentPassages'

function collectFacts(passage: AssessmentPassage): readonly string[] {
  return dedupeValues([...(passage.enrichment.concepts ?? []), ...(passage.enrichment.entities ?? []), ...(passage.enrichment.misconceptions ?? [])])
}

// Reading Assessment Engine™ — True/False. "True or False: '<value>' was
// mentioned in what you just read." Half the time (seeded, not random)
// the statement uses a real concept/entity/misconception from this
// passage's own enrichment (True); the other half it uses one from
// another passage's enrichment, honestly making the statement False —
// never an invented fact. Returns null when this passage's own
// enrichment has nothing to build a real statement from.
export function buildTrueFalseQuestion(passage: AssessmentPassage, allPassages: readonly AssessmentPassage[]): AssessmentQuestion | null {
  const ownFacts = collectFacts(passage)
  if (ownFacts.length === 0) return null

  const seed = hashString(`${passage.chunkNodeId}-true-false`)
  const useOwnFact = seed % 2 === 0

  let statementValue: string
  if (useOwnFact) {
    statementValue = ownFacts[seed % ownFacts.length] ?? ownFacts[0]!
  } else {
    const otherFacts = dedupeValues(allPassages.filter((other) => other.chunkNodeId !== passage.chunkNodeId).flatMap(collectFacts)).filter(
      (value) => !ownFacts.some((own) => normalize(own) === normalize(value)),
    )
    if (otherFacts.length === 0) return null
    statementValue = otherFacts[seed % otherFacts.length] ?? otherFacts[0]!
  }

  return {
    type: 'true-false',
    prompt: `True or False: "${statementValue}" was mentioned in what you just read.`,
    options: [
      { value: 'True', isCorrect: useOwnFact },
      { value: 'False', isCorrect: !useOwnFact },
    ],
  }
}
