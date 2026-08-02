// Quantum Speed Reading™ (Sprint LW-2) reading-passage types. The passage
// is entirely mock-generated from a LearningBlueprint (see
// src/lib/reading/generateReadingPassage.ts) — never the uploaded
// document's real text, since no format stores real content anywhere yet
// (see constants/documents/index.ts's own disclosure). Same honesty level
// as every other generated field in this arc.

export type ReadingSection = {
  id: string
  heading: string
  paragraphs: readonly string[]
}

export type ReadingPassage = {
  documentTitle: string
  sections: readonly ReadingSection[]
  wordCount: number
  estimatedMinutes: number
}
