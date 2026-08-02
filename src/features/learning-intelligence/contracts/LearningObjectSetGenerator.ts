import type { LearningObjectDataByType, LearningObjectType } from '../types'
import type { GeneratorInput } from './LearningObjectGenerator'

// Sibling to LearningObjectGenerator<TType>, added in Chunk 3.
// LearningObjectGenerator fits a generator that produces exactly one
// object of a type (e.g. a future single-document Summary). Flashcards,
// Quiz Questions, Practice Questions, and Revision Blocks are each
// naturally many-per-document (typically one per Concept) — a
// LearningObjectSetGenerator<TType> produces that whole collection.
// Kept as its own interface rather than changing
// LearningObjectGenerator's existing shape, since Chunk 1's contract is
// still correct for the single-object case and this sprint doesn't
// modify Chunk 1's files.
export interface LearningObjectSetGenerator<TType extends LearningObjectType> {
  readonly objectType: TType
  generate(input: GeneratorInput): Promise<readonly LearningObjectDataByType[TType][]>
}
