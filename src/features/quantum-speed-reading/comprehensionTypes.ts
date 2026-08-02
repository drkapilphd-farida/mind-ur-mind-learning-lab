// Comprehension Intelligence Engine™ — Sprint 3 of Quantum Speed Reading™.
// Deliberately a separate file rather than a field added to `Passage`
// (passageLibrary.ts) — Sprint-1/2 are locked, so this pack's questions
// live in their own self-contained file (comprehensionQuestions.ts),
// keyed by passage id, the same "own feature folder, never registry
// -pooled" convention every dataset in this pack already follows.

// What is being asked. Architecture supports more than the 5 slots used
// per passage today (Main Idea/Key Detail/Vocabulary/Inference always
// appear; the 5th rotates between Sequence and Cause-and-Effect depending
// on which genuinely fits that passage).
export type ComprehensionQuestionType =
  | 'main-idea'
  | 'key-detail'
  | 'sequence'
  | 'cause-effect'
  | 'vocabulary'
  | 'inference'

// How the learner answers. True/False is a 2-option case of single-choice,
// not a separate UI — kept distinct here only because it changes copy
// ("True or False" label) and is useful for future expansion (e.g. a
// dedicated toggle UI later) without touching this type again.
export type ResponseFormat = 'single-choice' | 'true-false' | 'multi-select' | 'ordering'

export type ComprehensionQuestion = {
  id: string
  type: ComprehensionQuestionType
  format: ResponseFormat
  prompt: string
  // For single-choice/true-false/multi-select: the answer options.
  // For ordering: the items to be placed in the correct order.
  options: readonly string[]
  correctIndex?: number // single-choice, true-false
  correctIndices?: readonly number[] // multi-select (order-independent set)
  correctOrder?: readonly number[] // ordering — the correct permutation of `options` indices
  explanation: string
}

export type ComprehensionQuestionSet = {
  passageId: string
  questions: readonly ComprehensionQuestion[] // always exactly 5
}

// A learner's answer to one question — shape varies by format.
export type QuestionResponse =
  | { format: 'single-choice' | 'true-false'; selectedIndex: number }
  | { format: 'multi-select'; selectedIndices: readonly number[] }
  | { format: 'ordering'; order: readonly number[] }
