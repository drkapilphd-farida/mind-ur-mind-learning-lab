import { describe, expect, it } from 'vitest'
import { FIXED_NOW, makeEmptyULO, makeULO } from '../testFixtures'
import { startRuntime } from './startRuntime'

let counter = 0
const idFactory = (): string => `id-${(counter += 1)}`

describe('startRuntime', () => {
  it('starts an active runtime with a real wrapped LSE-1 session and a scheduled queue', async () => {
    const ulo = await makeULO()
    const result = startRuntime(ulo, 'learner-1', 'reading', 'sequential', { now: FIXED_NOW, idFactory })

    expect(result.success).toBe(true)
    if (!result.success) return

    const { state } = result
    expect(state.session.status).toBe('active')
    expect(state.session.learnerId).toBe('learner-1')
    expect(state.strategy).toBe('sequential')
    expect(state.scheduledQueue.items).toHaveLength(3)
    expect(state.position).toEqual({ queueIndex: 0, chunkNodeId: 'chunk-1' })
    expect(state.progress.completedChunkIds).toEqual([])
    expect(state.progress.completionPercentage).toBe(0)
    expect(state.skippedChunkIds).toEqual([])
    expect(state.revisitChunkIds).toEqual([])
    expect(state.repeatCounts).toEqual({})
    expect(state.version).toEqual({ schemaVersion: '1.0.0', revision: 1 })
    expect(state.createdAt).toBe('2026-01-01T00:00:00.000Z')
  })

  it('applies the real chosen chunk strategy to the scheduled queue, distinct from the wrapped session queue', async () => {
    const ulo = await makeULO()
    const result = startRuntime(ulo, 'learner-1', 'reading', 'priority-first', { now: FIXED_NOW, idFactory })

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.state.scheduledQueue.items.map((item) => item.chunkNodeId)).toEqual(['chunk-2', 'chunk-3', 'chunk-1'])
    expect(result.state.session.queue.items.map((item) => item.chunkNodeId)).toEqual(['chunk-1', 'chunk-2', 'chunk-3'])
    expect(result.state.position.chunkNodeId).toBe('chunk-2')
  })

  it('emits real position events plus progress-updated', async () => {
    const ulo = await makeULO()
    const result = startRuntime(ulo, 'learner-1', 'reading', 'sequential', { now: FIXED_NOW, idFactory })

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.state.eventLog).toEqual(result.events)
    expect(result.events.at(-1)).toMatchObject({ type: 'progress-updated', completionPercentage: 0 })
    expect(result.events[0]).toMatchObject({ type: 'chunk-started', chunkNodeId: 'chunk-1' })
  })

  it('starts a completed runtime with 100% progress for a real empty-queue ULO', async () => {
    const ulo = await makeEmptyULO()
    const result = startRuntime(ulo, 'learner-1', 'reading', 'sequential', { now: FIXED_NOW, idFactory })

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.state.session.status).toBe('completed')
    expect(result.state.position).toEqual({ queueIndex: 0, chunkNodeId: null })
    expect(result.state.progress.completionPercentage).toBe(1)
    expect(result.events.map((event) => event.type)).toEqual(['progress-updated', 'runtime-completed'])
  })
})
