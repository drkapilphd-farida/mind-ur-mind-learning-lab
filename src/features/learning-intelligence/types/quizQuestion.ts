export type QuizQuestionOption = {
  id: string
  text: string
  isCorrect: boolean
}

export type QuizQuestion = {
  id: string
  conceptId: string
  prompt: string
  // At least two options, exactly one correct — enforced by the
  // generator, not the type (a type-level tuple would over-constrain
  // future question shapes like multi-select).
  options: readonly QuizQuestionOption[]
}
