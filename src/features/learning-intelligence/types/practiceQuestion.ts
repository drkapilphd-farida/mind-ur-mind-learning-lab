// Open-ended, guided practice — distinct from QuizQuestion (which is
// scored, multiple-choice). No `options`; `guidance` is what a learner
// sees if they need a nudge rather than a correct/incorrect check.
export type PracticeQuestion = {
  id: string
  conceptId: string
  prompt: string
  guidance: string
}
