import { pickItems, shuffleArray } from '@/lib/exercise-engine/randomizationEngine'
import type { GeneratorInput, LearningObjectSetGenerator } from '../contracts'
import type { QuizQuestion, QuizQuestionOption } from '../types'
import { seedFromId } from './seed'

// Implements LearningObjectSetGenerator<'quiz-question'>. One
// multiple-choice question per Concept: the correct option is that
// concept's own real description; distractors are *other real
// concepts'* descriptions from the same graph (never fabricated text)
// — reuses the platform's existing seeded Randomization Engine
// (`src/lib/exercise-engine/randomizationEngine.ts`) for distractor
// selection and option order, rather than a second shuffle
// implementation. A document with only one concept honestly produces a
// single-option question rather than inventing distractors from
// nothing.
export const generateQuizGenerator: LearningObjectSetGenerator<'quiz-question'> = {
  objectType: 'quiz-question',
  async generate(input: GeneratorInput): Promise<readonly QuizQuestion[]> {
    const { concepts } = input.conceptGraph

    return concepts.map((concept, index) => {
      const seed = seedFromId(concept.id)
      const otherConcepts = concepts.filter((candidate) => candidate.id !== concept.id)
      const distractorConcepts = pickItems(otherConcepts, Math.min(3, otherConcepts.length), seed)

      const options: QuizQuestionOption[] = [
        { id: `${concept.id}-correct`, text: concept.description, isCorrect: true },
        ...distractorConcepts.map((distractor) => ({ id: `${concept.id}-distractor-${distractor.id}`, text: distractor.description, isCorrect: false })),
      ]

      return {
        id: `quiz-${concept.id}`,
        conceptId: concept.id,
        prompt: `What best describes "${concept.title}"?`,
        options: shuffleArray(options, seed + index),
      }
    })
  },
}

export async function generateQuiz(input: GeneratorInput): Promise<readonly QuizQuestion[]> {
  return generateQuizGenerator.generate(input)
}
