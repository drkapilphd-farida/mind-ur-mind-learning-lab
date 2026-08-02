import { describe, expect, it } from 'vitest'
import type { LearningQueue } from '../types/LearningQueue'
import { buildPositionEvents } from './buildPositionEvents'

const NOW = (): Date => new Date('2026-01-01T00:00:00.000Z')
let counter = 0
const idFactory = (): string => `id-${(counter += 1)}`

function makeQueue(): LearningQueue {
  return {
    items: [
      { chunkNodeId: 'chunk-1', order: 0, isCheckpoint: false },
      { chunkNodeId: 'chunk-2', order: 1, isCheckpoint: true, checkpointConceptNodeId: 'concept-1', checkpointLabel: 'Algebra' },
    ],
  }
}

describe('buildPositionEvents', () => {
  it('emits only chunk-started for a non-checkpoint item', () => {
    const events = buildPositionEvents(makeQueue(), 0, NOW, idFactory)
    expect(events).toEqual([{ id: expect.any(String), type: 'chunk-started', occurredAt: '2026-01-01T00:00:00.000Z', chunkNodeId: 'chunk-1' }])
  })

  it('emits chunk-started and checkpoint-reached for a checkpoint item', () => {
    const events = buildPositionEvents(makeQueue(), 1, NOW, idFactory)
    expect(events).toHaveLength(2)
    expect(events[0]?.type).toBe('chunk-started')
    expect(events[1]).toMatchObject({ type: 'checkpoint-reached', conceptNodeId: 'concept-1', label: 'Algebra' })
  })

  it('returns no events for an out-of-range queueIndex', () => {
    expect(buildPositionEvents(makeQueue(), 5, NOW, idFactory)).toEqual([])
  })
})
