import type { GeneratorInput, LearningObjectSetGenerator } from '../contracts'
import type { RevisionBlock } from '../types'

// Implements LearningObjectSetGenerator<'revision-block'>. One revision
// block per Concept — a spaced-repetition-friendly recap, denser than a
// Flashcard's front/back split, reusing the concept's own description
// rather than inventing new prose.
export const generateRevisionGenerator: LearningObjectSetGenerator<'revision-block'> = {
  objectType: 'revision-block',
  async generate(input: GeneratorInput): Promise<readonly RevisionBlock[]> {
    return input.conceptGraph.concepts.map((concept) => ({
      id: `revision-${concept.id}`,
      conceptId: concept.id,
      summary: `${concept.title}: ${concept.description}`,
    }))
  },
}

export async function generateRevision(input: GeneratorInput): Promise<readonly RevisionBlock[]> {
  return generateRevisionGenerator.generate(input)
}
