import { describe, expect, it } from 'vitest'
import { sequenceJourney } from './sequenceJourney'
import { sequenceExercises } from './sequenceExercises'
import { sequenceDifficultyProgression } from './sequenceDifficultyProgression'
import { sequenceReviewScheduling } from './sequenceReviewScheduling'
import { sequenceSessionGrouping } from './sequenceSessionGrouping'
import { makeAdaptivePlanExecutionFacts, makeStrategyResult } from '../testFixtures'

describe('sequenceJourney', () => {
  it('produces one step for the recommended journey', () => {
    const sequence = sequenceJourney(makeAdaptivePlanExecutionFacts({ journey: 'quantum-speed-reading' }))
    expect(sequence).toEqual({
      type: 'journey',
      steps: [{ id: 'journey-quantum-speed-reading', sequenceType: 'journey', referenceId: 'quantum-speed-reading', order: 0, priority: 'high', detail: expect.any(String) }],
    })
  })

  it('produces an empty sequence when no journey was recommended', () => {
    expect(sequenceJourney(makeAdaptivePlanExecutionFacts({ journey: null }))).toEqual({ type: 'journey', steps: [] })
  })
})

describe('sequenceExercises', () => {
  it('produces one step per exercise id, in planner order', () => {
    const sequence = sequenceExercises(makeAdaptivePlanExecutionFacts({ exerciseIds: ['ex-a', 'ex-b'] }))
    expect(sequence.type).toBe('exercise')
    expect(sequence.steps).toEqual([
      { id: 'exercise-ex-a', sequenceType: 'exercise', referenceId: 'ex-a', order: 0, priority: 'normal', detail: expect.any(String) },
      { id: 'exercise-ex-b', sequenceType: 'exercise', referenceId: 'ex-b', order: 1, priority: 'normal', detail: expect.any(String) },
    ])
  })

  it('produces an empty sequence when no exercises were recommended', () => {
    expect(sequenceExercises(makeAdaptivePlanExecutionFacts({ exerciseIds: [] }))).toEqual({ type: 'exercise', steps: [] })
  })
})

describe('sequenceDifficultyProgression', () => {
  it('prefers the selected difficulty StrategyResult over the planner fallback', () => {
    const strategyResult = makeStrategyResult({ type: 'difficulty', value: 'advanced' })
    const sequence = sequenceDifficultyProgression([strategyResult], makeAdaptivePlanExecutionFacts({ difficultyLevel: 'beginner' }))
    expect(sequence.steps).toHaveLength(1)
    expect(sequence.steps[0]?.referenceId).toBe('advanced')
  })

  it('falls back to the Adaptive Learning Planner difficulty level when no strategy was selected', () => {
    const sequence = sequenceDifficultyProgression([], makeAdaptivePlanExecutionFacts({ difficultyLevel: 'beginner' }))
    expect(sequence.steps[0]?.referenceId).toBe('beginner')
  })

  it('produces an empty sequence when neither source has a value', () => {
    expect(sequenceDifficultyProgression([], makeAdaptivePlanExecutionFacts({ difficultyLevel: null }))).toEqual({ type: 'difficulty', steps: [] })
  })
})

describe('sequenceReviewScheduling', () => {
  it('produces one step from the selected review-frequency StrategyResult', () => {
    const strategyResult = makeStrategyResult({ type: 'review-frequency', value: 'daily' })
    const sequence = sequenceReviewScheduling([strategyResult])
    expect(sequence.steps).toEqual([{ id: `review-${strategyResult.strategyId}`, sequenceType: 'review', referenceId: 'daily', order: 0, priority: 'normal', detail: expect.any(String) }])
  })

  it('produces an empty sequence when no review-frequency strategy was selected', () => {
    expect(sequenceReviewScheduling([])).toEqual({ type: 'review', steps: [] })
  })
})

describe('sequenceSessionGrouping', () => {
  it('prefers the selected session-length StrategyResult over the planner fallback', () => {
    const strategyResult = makeStrategyResult({ type: 'session-length', value: '45' })
    const sequence = sequenceSessionGrouping([strategyResult], makeAdaptivePlanExecutionFacts({ sessionDurationMinutes: 20 }))
    expect(sequence.steps[0]?.referenceId).toBe('45')
  })

  it('falls back to the Adaptive Learning Planner session duration when no strategy was selected', () => {
    const sequence = sequenceSessionGrouping([], makeAdaptivePlanExecutionFacts({ sessionDurationMinutes: 20 }))
    expect(sequence.steps[0]?.referenceId).toBe('20')
  })

  it('produces an empty sequence when neither source has a value', () => {
    expect(sequenceSessionGrouping([], makeAdaptivePlanExecutionFacts({ sessionDurationMinutes: null }))).toEqual({ type: 'session', steps: [] })
  })
})
