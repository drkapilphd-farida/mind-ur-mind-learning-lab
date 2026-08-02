// Comprehension Intelligence Engine™ — option-order randomization.
// comprehensionQuestions.ts authors every option list with the correct
// answer fixed at index 0 (or, for `ordering`, already in the correct
// sequence) — a real production bug: a learner can answer correctly
// without reading, just by always picking the first option. This module
// shuffles the *display* order of each question's options at quiz-attempt
// time and remaps every correct-answer field to match, so the authored
// dataset itself never needs to change and every downstream consumer
// (isResponseCorrect, scoring, AI Reading Coach, Reading DNA™) keeps
// reading a self-consistent question object exactly as before.

import type { ComprehensionQuestion } from './comprehensionTypes'

// Fisher–Yates — unbiased, O(n), no library dependency. Indices i/j are
// always in [0, order.length) by construction, so the non-null assertions
// below are safe (same convention as multiLineEngine.ts/sentenceEngine.ts
// in this pack).
function shuffledIndexOrder(length: number, rng: () => number): number[] {
  const order = Array.from({ length }, (_, i) => i)
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const temp = order[i]!
    order[i] = order[j]!
    order[j] = temp
  }
  return order
}

// `order[newPosition] = originalIndex` — invert it so we can look up
// "where did the option originally at index X end up?" in O(1) when
// remapping correctIndex/correctIndices/correctOrder below.
function invertOrder(order: readonly number[]): number[] {
  const newPositionOf = new Array<number>(order.length)
  order.forEach((originalIndex, newPosition) => {
    newPositionOf[originalIndex] = newPosition
  })
  return newPositionOf
}

// Returns a new question with `options` shuffled and every correct-answer
// field remapped to the shuffled positions. The question's own identity
// (id/type/format/prompt/explanation) is untouched — explanations in this
// dataset always reference passage content, never option letters/positions,
// so they stay accurate after shuffling.
export function shuffleQuestionOptions(question: ComprehensionQuestion, rng: () => number = Math.random): ComprehensionQuestion {
  const order = shuffledIndexOrder(question.options.length, rng)
  const newPositionOf = invertOrder(order)
  const options = order.map((originalIndex) => question.options[originalIndex]!)

  const shuffled: ComprehensionQuestion = { ...question, options }
  if (question.correctIndex !== undefined) shuffled.correctIndex = newPositionOf[question.correctIndex]!
  if (question.correctIndices !== undefined) shuffled.correctIndices = question.correctIndices.map((originalIndex) => newPositionOf[originalIndex]!)
  if (question.correctOrder !== undefined) shuffled.correctOrder = question.correctOrder.map((originalIndex) => newPositionOf[originalIndex]!)
  return shuffled
}

// Applied once per quiz attempt (component mount) — never re-shuffle
// mid-attempt, or options would visibly reorder under the learner.
export function shuffleQuestionSet(questions: readonly ComprehensionQuestion[], rng: () => number = Math.random): ComprehensionQuestion[] {
  return questions.map((question) => shuffleQuestionOptions(question, rng))
}
