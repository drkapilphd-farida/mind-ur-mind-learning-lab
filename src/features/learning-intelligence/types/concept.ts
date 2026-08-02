// A Concept is the atomic unit every other Learning Object references
// by id (Flashcard.conceptId, QuizQuestion.conceptId, ...) — the
// Concept Graph stage of the pipeline produces these before anything
// downstream can be generated.
export type Concept = {
  id: string
  title: string
  description: string
  // Ids of other Concepts this one relates to — what makes a
  // ConceptGraph a graph rather than a flat list. Mock transformers
  // populate this with a small, believable set of relationships.
  relatedConceptIds: readonly string[]
}
