import { describe, expect, it } from 'vitest'
import { makeExerciseSequenceItem, makeModuleProgress } from '../testFixtures'
import { buildReadingExerciseQueue } from './buildReadingExerciseQueue'

describe('buildReadingExerciseQueue', () => {
  it('Exercise Queue: maps each item status directly from availabilityByExerciseId', () => {
    const sequence = [
      makeExerciseSequenceItem({ exerciseId: 'exercise-1', title: 'Exercise 1' }),
      makeExerciseSequenceItem({ exerciseId: 'exercise-2', title: 'Exercise 2' }),
      makeExerciseSequenceItem({ exerciseId: 'exercise-3', title: 'Exercise 3' }),
    ]
    const progress = makeModuleProgress({
      availabilityByExerciseId: { 'exercise-1': 'completed', 'exercise-2': 'current', 'exercise-3': 'locked' },
    })

    const queue = buildReadingExerciseQueue(sequence, progress)

    expect(queue.items.map((item) => item.status)).toEqual(['completed', 'current', 'locked'])
  })

  it('Exercise Queue: currentItem is the item whose status is current', () => {
    const sequence = [
      makeExerciseSequenceItem({ exerciseId: 'exercise-1' }),
      makeExerciseSequenceItem({ exerciseId: 'exercise-2' }),
    ]
    const progress = makeModuleProgress({
      availabilityByExerciseId: { 'exercise-1': 'completed', 'exercise-2': 'current' },
    })

    const queue = buildReadingExerciseQueue(sequence, progress)

    expect(queue.currentItem?.exerciseId).toBe('exercise-2')
  })

  it('Exercise Queue: currentItem is null when no item is current', () => {
    const sequence = [makeExerciseSequenceItem({ exerciseId: 'exercise-1' })]
    const progress = makeModuleProgress({ availabilityByExerciseId: { 'exercise-1': 'completed' } })

    expect(buildReadingExerciseQueue(sequence, progress).currentItem).toBeNull()
  })

  it('Exercise Queue: remainingCount excludes only completed items', () => {
    const sequence = [
      makeExerciseSequenceItem({ exerciseId: 'exercise-1' }),
      makeExerciseSequenceItem({ exerciseId: 'exercise-2' }),
      makeExerciseSequenceItem({ exerciseId: 'exercise-3' }),
    ]
    const progress = makeModuleProgress({
      availabilityByExerciseId: { 'exercise-1': 'completed', 'exercise-2': 'current', 'exercise-3': 'locked' },
    })

    expect(buildReadingExerciseQueue(sequence, progress).remainingCount).toBe(2)
  })

  it('defaults an exercise missing from availabilityByExerciseId to locked', () => {
    const sequence = [makeExerciseSequenceItem({ exerciseId: 'unregistered-exercise' })]
    const progress = makeModuleProgress({ availabilityByExerciseId: {} })

    expect(buildReadingExerciseQueue(sequence, progress).items[0]?.status).toBe('locked')
  })

  it('Determinism: identical inputs produce identical output', () => {
    const sequence = [makeExerciseSequenceItem()]
    const progress = makeModuleProgress()

    expect(buildReadingExerciseQueue(sequence, progress)).toEqual(buildReadingExerciseQueue(sequence, progress))
  })
})
