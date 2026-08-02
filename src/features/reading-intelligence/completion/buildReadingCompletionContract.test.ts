import { describe, expect, it } from 'vitest'
import { buildReadingCompletionContract } from './buildReadingCompletionContract'

describe('buildReadingCompletionContract', () => {
  it('Completion Experience: returns null progressLabel when there is no stage', () => {
    expect(buildReadingCompletionContract(null, null)).toEqual({ progressLabel: null })
  })

  it('Completion Experience: returns the stage title alone when there is no position', () => {
    expect(buildReadingCompletionContract('Reading Preparation™', null)).toEqual({
      progressLabel: 'Reading Preparation™',
    })
  })

  it('Completion Experience: combines stage title and position when both are present', () => {
    expect(buildReadingCompletionContract('Reading Preparation™', { index: 2, total: 5 })).toEqual({
      progressLabel: 'Reading Preparation™ — 2 of 5',
    })
  })

  it('Determinism: identical inputs produce identical output', () => {
    expect(buildReadingCompletionContract('Flash Intelligence Pack™', { index: 1, total: 3 })).toEqual(
      buildReadingCompletionContract('Flash Intelligence Pack™', { index: 1, total: 3 }),
    )
  })
})
