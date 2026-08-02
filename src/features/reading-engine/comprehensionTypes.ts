// Comprehension Checkpoint Sprint — shared types for the post-block MCQ
// comprehension system used by Paragraph Reading and Sentence Reading.
// A new, additive file (not a modification of types.ts) — kept separate
// from the Master Reading Engine's own locked ReadingUnit/ReadingSessionResult
// types, since this is a mode-orchestration concern layered *above* the
// content-agnostic engine, not part of it.

export type ComprehensionOption = {
  id: string
  text: string
}

export type ComprehensionQuestion = {
  id: string
  prompt: string
  options: readonly ComprehensionOption[]
  correctOptionId: string
}

// One MCQ set covering one reading "block" (one paragraph, or one
// sentence-difficulty Level). `blockId` matches the block's own content
// key so a mode's Experience can look up the right question set for
// whichever block just finished.
export type ComprehensionBlock = {
  blockId: string
  questions: readonly ComprehensionQuestion[]
}
