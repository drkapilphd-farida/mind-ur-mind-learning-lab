import { describe, expect, it } from 'vitest'
import type { AssessmentExerciseAsset } from '@/core/universal-learning-engine/exercise-asset-builder'
import { toAssessmentQuestions } from './toAssessmentQuestions'

const assets: AssessmentExerciseAsset[] = [
  {
    id: 'a1',
    prompt: 'What is the definition of "Photosynthesis"?',
    options: ['Converts light into chemical energy.', 'Releases energy from glucose.', 'A type of cell division.'],
    correctIndex: 0,
    sourceObjectId: 'obj-photosynthesis',
    questionKind: 'definition',
  },
]

describe('toAssessmentQuestions', () => {
  it('maps prompt verbatim and type to multiple-choice', () => {
    const questions = toAssessmentQuestions(assets)
    expect(questions[0]?.prompt).toBe('What is the definition of "Photosynthesis"?')
    expect(questions[0]?.type).toBe('multiple-choice')
  })

  it('reshapes options into {value, isCorrect} with exactly one correct option at the right index', () => {
    const questions = toAssessmentQuestions(assets)
    const options = questions[0]?.options ?? []
    expect(options.map((o) => o.value)).toEqual(['Converts light into chemical energy.', 'Releases energy from glucose.', 'A type of cell division.'])
    expect(options.filter((o) => o.isCorrect)).toHaveLength(1)
    expect(options[0]?.isCorrect).toBe(true)
    expect(options[1]?.isCorrect).toBe(false)
  })

  it('never throws and returns an empty array for no assets', () => {
    expect(toAssessmentQuestions([])).toEqual([])
  })
})
