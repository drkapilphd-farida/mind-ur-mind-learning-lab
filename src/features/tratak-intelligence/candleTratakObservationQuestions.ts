// Visual Intelligence Lab™ — Candle Tratak™, Sprint 10F architecture
// refinement. Observation Intelligence™'s question set for the one real
// Candle Tratak™ image — same generator-function pattern as
// mandalaObservationQuestions.ts / imagePersistenceObservationQuestions.ts,
// a small deliberate local duplicate rather than a cross-import.
//
// Sprint 10F enhancement: reduced to exactly ONE question (was 3) —
// "reduce friction, maximum 2-3 interactions per image."

import type { ObservationQuestion, ObservationQuestionOption } from './mandalaObservationQuestions'
import { CANDLE_TRATAK_IMAGE } from './candleTratakImage'

export type CandleTratakObservationQuestionSet = {
  imageId: string
  questions: readonly ObservationQuestion[]
}

function flameLayerCountQuestion(correctCount: number): ObservationQuestion {
  const distractors = [correctCount - 1, correctCount + 1, correctCount + 2].filter((n) => n >= 1 && n !== correctCount)
  const counts = Array.from(new Set([correctCount, ...distractors])).slice(0, 3)
  const options: ObservationQuestionOption[] = [...counts.map((count) => ({ id: `count-${count}`, label: String(count) })), { id: 'not-sure', label: 'Not Sure' }]
  return { id: 'flame-layer-count', text: 'How many distinct flame colour layers did you notice?', options, correctOptionId: `count-${correctCount}` }
}

export const CANDLE_TRATAK_OBSERVATION_QUESTIONS: Record<string, CandleTratakObservationQuestionSet> = {
  [CANDLE_TRATAK_IMAGE.id]: {
    imageId: CANDLE_TRATAK_IMAGE.id,
    questions: [flameLayerCountQuestion(3)],
  },
}
