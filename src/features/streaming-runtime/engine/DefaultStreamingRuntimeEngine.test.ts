import { describe, expect, it, vi } from 'vitest'
import type { StreamingLifecycleManager } from '../lifecycleManager'
import { makeStreamingRunInputs } from '../testFixtures'
import { createStreamingRuntimeEngine } from './DefaultStreamingRuntimeEngine'

describe('DefaultStreamingRuntimeEngine', () => {
  it('Thin Delegation: run() delegates directly to the injected StreamingLifecycleManager', () => {
    const inputs = makeStreamingRunInputs()
    const stubResult = {
      session: { id: inputs.sessionId, state: 'completed' as const, bufferState: { chunks: [], totalContentLength: 0 } },
      status: 'completed' as const,
      assembledResponse: 'stubbed',
      diagnostics: {
        sessionId: inputs.sessionId,
        state: 'completed' as const,
        chunksReceived: 0,
        bufferedChunkCount: 0,
        partialResponse: '',
        assembledLength: 0,
        validation: { valid: true, issues: [] },
      },
      validation: { valid: true, issues: [] },
    }
    const runSpy = vi.fn().mockReturnValue(stubResult)
    const stubLifecycleManager: StreamingLifecycleManager = { run: runSpy }

    const engine = createStreamingRuntimeEngine({ lifecycleManager: stubLifecycleManager })
    const result = engine.run(inputs)

    expect(runSpy).toHaveBeenCalledWith(inputs)
    expect(result).toBe(stubResult)
  })

  it('produces a real result end-to-end when no overrides are given', () => {
    const engine = createStreamingRuntimeEngine()
    const result = engine.run(makeStreamingRunInputs())

    expect(result.status).toBe('completed')
  })

  it('Determinism: two independently-constructed engines produce identical results for identical inputs', () => {
    const engineA = createStreamingRuntimeEngine()
    const engineB = createStreamingRuntimeEngine()
    const inputs = makeStreamingRunInputs()

    expect(engineA.run(inputs)).toEqual(engineB.run(inputs))
  })
})
