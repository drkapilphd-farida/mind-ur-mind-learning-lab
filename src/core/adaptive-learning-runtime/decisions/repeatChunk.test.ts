import { describe, expect, it } from 'vitest'
import { FIXED_NOW, makeULO } from '../testFixtures'
import { startRuntime } from './startRuntime'
import { repeatChunk } from './repeatChunk'

let counter = 0
const idFactory = (): string => `id-${(counter += 1)}`

describe('repeatChunk', () => {
  it('increments repeatCounts for the current chunk without advancing position', async () => {
    const ulo = await makeULO()
    const started = startRuntime(ulo, 'learner-1', 'reading', 'sequential', { now: FIXED_NOW, idFactory })
    if (!started.success) throw new Error('fixture failed')

    const result = repeatChunk(started.state, { now: FIXED_NOW, idFactory })

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.state.position).toEqual(started.state.position)
    expect(result.state.repeatCounts).toEqual({ 'chunk-1': 1 })
    expect(result.events).toEqual([{ id: expect.any(String), type: 'chunk-repeated', occurredAt: '2026-01-01T00:00:00.000Z', chunkNodeId: 'chunk-1', repeatCount: 1 }])
  })

  it('increments a second time on a second call for the same chunk', async () => {
    const ulo = await makeULO()
    const started = startRuntime(ulo, 'learner-1', 'reading', 'sequential', { now: FIXED_NOW, idFactory })
    if (!started.success) throw new Error('fixture failed')

    const first = repeatChunk(started.state, { now: FIXED_NOW, idFactory })
    if (!first.success) throw new Error('unexpected failure')
    const second = repeatChunk(first.state, { now: FIXED_NOW, idFactory })

    expect(second.success).toBe(true)
    if (!second.success) return
    expect(second.state.repeatCounts).toEqual({ 'chunk-1': 2 })
  })
})
