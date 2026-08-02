// A short, spaced-repetition-friendly recap of one Concept — denser
// than a Flashcard's front/back pair, meant for a single re-read pass
// rather than active recall.
export type RevisionBlock = {
  id: string
  conceptId: string
  summary: string
}
