import { describe, expect, it } from 'vitest'
import { makeRuntime } from './testFixtures'
import { deriveRuntimeContext } from './deriveRuntimeContext'

describe('deriveRuntimeContext', () => {
  it('gathers real ambient identifiers off the runtime and its wrapped session', async () => {
    const runtime = await makeRuntime()
    const context = deriveRuntimeContext(runtime)

    expect(context).toEqual({
      learnerId: runtime.session.learnerId,
      documentId: runtime.session.documentId,
      uloId: runtime.session.uloId,
      uloVersion: runtime.session.uloVersion,
      sessionId: runtime.session.id,
      runtimeId: runtime.id,
      sessionType: runtime.session.sessionType,
    })
  })
})
