import { describe, expect, it } from 'vitest'
import { FIXED_NOW, makeIdFactory, makeRuntime, makeULO } from '../testFixtures'
import { recoverRuntime } from './recoverRuntime'

describe('recoverRuntime', () => {
  it('returns a real healthy runtime completely unchanged, with zero events', async () => {
    const ulo = await makeULO()
    const runtime = await makeRuntime(ulo)

    const result = recoverRuntime(runtime, ulo, { now: FIXED_NOW, idFactory: makeIdFactory() })

    expect(result).toEqual({ success: true, state: runtime, events: [] })
  })

  it('recovers an unhealthy runtime via a real fresh startRuntime call against the current ULO', async () => {
    const ulo = await makeULO()
    const runtime = await makeRuntime(ulo)
    const mismatchedUlo = { ...(await makeULO()), id: 'a-different-ulo-id' }

    const result = recoverRuntime(runtime, mismatchedUlo, { now: FIXED_NOW, idFactory: makeIdFactory() })

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.state.session.uloId).toBe(mismatchedUlo.id)
    expect(result.state.position.queueIndex).toBe(0)
  })
})
