// Reading Assessment Engine™ — every question type the brief names
// (Multiple Choice, Fill in the Blank, True/False, Keyword
// Identification, Main Idea) stays selectable-option-shaped internally,
// never free-text entry — the only grading mechanism this codebase's
// real (non-static) question builders have ever used, and the only one
// that keeps every builder deterministic and testable.
export type AssessmentQuestionType = 'multiple-choice' | 'main-idea' | 'keyword-identification' | 'true-false' | 'fill-in-the-blank'

export type AssessmentQuestionOption = {
  value: string
  isCorrect: boolean
}

export type AssessmentQuestion = {
  type: AssessmentQuestionType
  prompt: string
  options: readonly AssessmentQuestionOption[]
}
