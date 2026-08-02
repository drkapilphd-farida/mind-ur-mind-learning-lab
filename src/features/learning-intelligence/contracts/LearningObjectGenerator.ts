import type { ConceptGraph, ExtractedContent, LearningObjectDataByType, LearningObjectType } from '../types'

// Every generator's real input — the two upstream pipeline stages it's
// allowed to read from. A generator that only needs concepts (e.g.
// generateFlashcards) simply ignores `extractedContent`; one that wants
// original section text (e.g. generateSummary) uses both.
export type GeneratorInput = {
  extractedContent: ExtractedContent
  conceptGraph: ConceptGraph
}

// One contract shape for all eight generators (dependency inversion —
// generators/ implements this with mock logic; the engine/ orchestrator
// depends only on this interface, never on a concrete generator file
// directly). `TType` pins the contract to exactly one
// LearningObjectType's payload shape per generator, so
// `generateFlashcards` can't accidentally return a QuizQuestion.
export interface LearningObjectGenerator<TType extends LearningObjectType> {
  readonly objectType: TType
  generate(input: GeneratorInput): Promise<LearningObjectDataByType[TType]>
}
