import { describe, expect, it } from 'vitest'
import { FIXED_NOW, makeULO } from '../testFixtures'
import { startRuntime } from './startRuntime'
import { revisitLater } from './revisitLater'

let counter = 0
const idFactory = (): string => `id-${(counter += 1)}`

describe('revisitLater', () => {
  it('marks the current chunk for revisit without advancing position', async () => {
    const ulo = await makeULO()
    const started = startRuntime(ulo, 'learner-1', 'reading', 'sequential', { now: FIXED_NOW, idFactory })
    if (!started.success) throw new Error('fixture failed')

    const result = revisitLater(started.state, { now: FIXED_NOW, idFactory })

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.state.position).toEqual(started.state.position)
    expect(result.state.revisitChunkIds).toEqual(['chunk-1'])
    expect(result.events).toEqual([{ id: expect.any(String), type: 'chunk-marked-for-revisit', occurredAt: '2026-01-01T00:00:00.000Z', chunkNodeId: 'chunk-1' }])
  })

  it('is idempotent — marking the same chunk twice does not duplicate it', async () => {
    const ulo = await makeULO()
    const started = startRuntime(ulo, 'learner-1', 'reading', 'sequential', { now: FIXED_NOW, idFactory })
    if (!started.success) throw new Error('fixture failed')

    const first = revisitLater(started.state, { now: FIXED_NOW, idFactory })
    if (!first.success) throw new Error('unexpected failure')
    const second = revisitLater(first.state, { now: FIXED_NOW, idFactory })

    expect(second.success).toBe(true)
    if (!second.success) return
    expect(second.state.revisitChunkIds).toEqual(['chunk-1'])
  })
})
