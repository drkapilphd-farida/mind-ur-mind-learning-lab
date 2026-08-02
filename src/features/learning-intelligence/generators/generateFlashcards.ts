import type { GeneratorInput, LearningObjectSetGenerator } from '../contracts'
import type { Flashcard } from '../types'

// Implements LearningObjectSetGenerator<'flashcard'>. One flashcard per
// Concept — front/back drawn from that concept's own real title and
// description, never invented content. `extractedContent` is part of
// GeneratorInput but unused here; concepts alone are enough for a
// flashcard.
export const generateFlashcardsGenerator: LearningObjectSetGenerator<'flashcard'> = {
  objectType: 'flashcard',
  async generate(input: GeneratorInput): Promise<readonly Flashcard[]> {
    return input.conceptGraph.concepts.map((concept) => ({
      id: `flashcard-${concept.id}`,
      conceptId: concept.id,
      front: concept.title,
      back: concept.description,
    }))
  },
}

export async function generateFlashcards(input: GeneratorInput): Promise<readonly Flashcard[]> {
  return generateFlashcardsGenerator.generate(input)
}
