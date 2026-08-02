import { describe, expect, it } from 'vitest'
import { shuffleQuestionOptions, shuffleQuestionSet } from './comprehensionShuffle'
import { isResponseCorrect } from './comprehensionEngine'
import type { ComprehensionQuestion } from './comprehensionTypes'

function sequentialRng(sequence: readonly number[]): () => number {
  let i = 0
  return () => sequence[i++ % sequence.length] ?? 0
}

const singleChoiceQuestion: ComprehensionQuestion = {
  id: 'q1',
  type: 'main-idea',
  format: 'single-choice',
  prompt: 'What is this about?',
  options: ['Photosynthesis', 'Respiration', 'Digestion', 'Evaporation'],
  correctIndex: 0,
  explanation: 'The passage is about photosynthesis.',
}

const multiSelectQuestion: ComprehensionQuestion = {
  id: 'q2',
  type: 'inference',
  format: 'multi-select',
  prompt: 'Select all that apply',
  options: ['A', 'B', 'C', 'D'],
  correctIndices: [0, 2],
  explanation: 'A and C are supported by the passage.',
}

const orderingQuestion: ComprehensionQuestion = {
  id: 'q3',
  type: 'sequence',
  format: 'ordering',
  prompt: 'Put these in order',
  options: ['First', 'Second', 'Third', 'Fourth'],
  correctOrder: [0, 1, 2, 3],
  explanation: 'This is the sequence described in the passage.',
}

describe('shuffleQuestionOptions', () => {
  it('reorders options and moves the correct answer to its new position (Option A -> Option B)', () => {
    // Deterministic Fisher-Yates walk (verified by hand): swaps index 1 and 0,
    // leaves 2 and 3 in place -> displayed order [Respiration, Photosynthesis, Digestion, Evaporation].
    const rng = sequentialRng([0.9, 0.9, 0.4])
    const shuffled = shuffleQuestionOptions(singleChoiceQuestion, rng)

    expect(shuffled.options).toEqual(['Respiration', 'Photosynthesis', 'Digestion', 'Evaporation'])
    expect(shuffled.correctIndex).toBe(1)
    expect(shuffled.options[shuffled.correctIndex as number]).toBe('Photosynthesis')
  })

  it('never leaves the correct answer at index 0 across many runs (statistical, not always-A)', () => {
    const positions = new Set<number>()
    for (let i = 0; i < 200; i++) {
      const shuffled = shuffleQuestionOptions(singleChoiceQuestion)
      positions.add(shuffled.correctIndex as number)
    }
    // With 200 runs of a 4-option Fisher-Yates shuffle, every position must appear at least once.
    expect(positions.size).toBe(4)
  })

  it('remaps multi-select correctIndices to the new positions of the same option text', () => {
    const shuffled = shuffleQuestionOptions(multiSelectQuestion)
    const correctTexts = (shuffled.correctIndices ?? []).map((i) => shuffled.options[i])
    expect(new Set(correctTexts)).toEqual(new Set(['A', 'C']))
  })

  it('remaps ordering correctOrder so the same item sequence is still correct', () => {
    const shuffled = shuffleQuestionOptions(orderingQuestion)
    const correctSequenceTexts = (shuffled.correctOrder ?? []).map((i) => shuffled.options[i])
    expect(correctSequenceTexts).toEqual(['First', 'Second', 'Third', 'Fourth'])
  })

  it('leaves the question id/type/format/prompt/explanation untouched', () => {
    const shuffled = shuffleQuestionOptions(singleChoiceQuestion)
    expect(shuffled.id).toBe(singleChoiceQuestion.id)
    expect(shuffled.type).toBe(singleChoiceQuestion.type)
    expect(shuffled.format).toBe(singleChoiceQuestion.format)
    expect(shuffled.prompt).toBe(singleChoiceQuestion.prompt)
    expect(shuffled.explanation).toBe(singleChoiceQuestion.explanation)
  })

  it('produces a shuffled question that isResponseCorrect still scores correctly (single-choice)', () => {
    const shuffled = shuffleQuestionOptions(singleChoiceQuestion)
    const correctIndex = shuffled.correctIndex as number
    expect(isResponseCorrect(shuffled, { format: 'single-choice', selectedIndex: correctIndex })).toBe(true)
    const wrongIndex = correctIndex === 0 ? 1 : 0
    expect(isResponseCorrect(shuffled, { format: 'single-choice', selectedIndex: wrongIndex })).toBe(false)
  })

  it('produces a shuffled question that isResponseCorrect still scores correctly (multi-select)', () => {
    const shuffled = shuffleQuestionOptions(multiSelectQuestion)
    expect(isResponseCorrect(shuffled, { format: 'multi-select', selectedIndices: shuffled.correctIndices ?? [] })).toBe(true)
  })

  it('produces a shuffled question that isResponseCorrect still scores correctly (ordering)', () => {
    const shuffled = shuffleQuestionOptions(orderingQuestion)
    expect(isResponseCorrect(shuffled, { format: 'ordering', order: shuffled.correctOrder ?? [] })).toBe(true)
    expect(isResponseCorrect(shuffled, { format: 'ordering', order: [...(shuffled.correctOrder ?? [])].reverse() })).toBe(false)
  })
})

describe('shuffleQuestionSet', () => {
  it('shuffles every question in the set independently', () => {
    const result = shuffleQuestionSet([singleChoiceQuestion, multiSelectQuestion, orderingQuestion])
    expect(result).toHaveLength(3)
    expect(result.map((q) => q.id)).toEqual(['q1', 'q2', 'q3'])
  })
})
