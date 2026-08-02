import { describe, expect, it } from 'vitest'
import { computeNeuralEvolutionIndex, type NeuralEvolutionDimension } from './neuralEvolutionIndex'

const COMING_SOON: NeuralEvolutionDimension[] = [
  { id: 'brain-adaptation', label: 'Brain Adaptation', status: 'coming-soon', score: null },
  { id: 'attention-stability', label: 'Attention Stability', status: 'coming-soon', score: null },
  { id: 'learning-readiness', label: 'Learning Readiness', status: 'coming-soon', score: null },
  { id: 'cognitive-flexibility', label: 'Cognitive Flexibility', status: 'coming-soon', score: null },
]

describe('computeNeuralEvolutionIndex', () => {
  it('returns overallScore 0 with zero active contributions', () => {
    const result = computeNeuralEvolutionIndex(COMING_SOON)
    expect(result.overallScore).toBe(0)
    expect(result.activeDimensionCount).toBe(0)
  })

  it('averages only active dimensions, ignoring coming-soon ones', () => {
    const result = computeNeuralEvolutionIndex([
      { id: 'visual-intelligence', label: 'Visual Intelligence', status: 'active', score: 60 },
      ...COMING_SOON,
    ])
    expect(result.overallScore).toBe(60)
    expect(result.activeDimensionCount).toBe(1)
  })

  it('preserves all dimensions (including coming-soon) in the output for display', () => {
    const result = computeNeuralEvolutionIndex([
      { id: 'visual-intelligence', label: 'Visual Intelligence', status: 'active', score: 60 },
      ...COMING_SOON,
    ])
    expect(result.dimensions).toHaveLength(5)
  })
})
