import type { GeneratorInput, LearningObjectSetGenerator } from '../contracts'
import type { PracticeQuestion } from '../types'

// Implements LearningObjectSetGenerator<'practice-question'>. One
// open-ended practice prompt per Concept — `guidance` reuses the
// concept's real description as the nudge a learner sees if they get
// stuck, rather than a scored multiple-choice check (that's
// generateQuiz's job).
export const generatePracticeGenerator: LearningObjectSetGenerator<'practice-question'> = {
  objectType: 'practice-question',
  async generate(input: GeneratorInput): Promise<readonly PracticeQuestion[]> {
    return input.conceptGraph.concepts.map((concept) => ({
      id: `practice-${concept.id}`,
      conceptId: concept.id,
      prompt: `Explain, in your own words: ${concept.title}.`,
      guidance: concept.description,
    }))
  },
}

export async function generatePractice(input: GeneratorInput): Promise<readonly PracticeQuestion[]> {
  return generatePracticeGenerator.generate(input)
}
