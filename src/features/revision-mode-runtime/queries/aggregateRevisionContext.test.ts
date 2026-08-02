import { describe, expect, it } from 'vitest'
import { makeSessionSnapshot } from '@/features/learning-mode-runtime/testFixtures'
import { aggregateRevisionContext } from './aggregateRevisionContext'

describe('aggregateRevisionContext', () => {
  it('reports no real history, honestly, when there are no past sessions', () => {
    expect(aggregateRevisionContext([])).toEqual({ hasHistory: false, skippedCount: 0, revisitedCount: 0 })
  })

  it('counts real, deduplicated skipped/revisited chunks across multiple real past sessions', async () => {
    const { snapshot: readingSnapshot } = await makeSessionSnapshot('learner-1', 'reading')
    const { snapshot: memorySnapshot } = await makeSessionSnapshot('learner-1', 'memory')

    const withReadingHistory = { ...readingSnapshot, skippedChunkIds: ['chunk-1', 'chunk-2'], revisitChunkIds: ['chunk-3'] }
    const withMemoryHistory = { ...memorySnapshot, skippedChunkIds: ['chunk-2'], revisitChunkIds: ['chunk-3', 'chunk-4'] }

    const context = aggregateRevisionContext([withReadingHistory, withMemoryHistory])

    expect(context).toEqual({ hasHistory: true, skippedCount: 2, revisitedCount: 2 })
  })
})
