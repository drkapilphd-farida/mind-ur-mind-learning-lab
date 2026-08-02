import { describe, expect, it } from 'vitest'
import { IllegalStreamingTransitionError } from '../stateMachine'
import { makeStreamBufferPolicy, makeStreamChunk, makeStreamingRunInputs } from '../testFixtures'
import { createStreamingLifecycleManager } from './DefaultStreamingLifecycleManager'

describe('DefaultStreamingLifecycleManager', () => {
  it('Streaming Lifecycle: a well-formed run reaches completed with the assembled response', () => {
    const manager = createStreamingLifecycleManager()
    const result = manager.run(makeStreamingRunInputs())

    expect(result.status).toBe('completed')
    expect(result.session.state).toBe('completed')
    expect(result.assembledResponse).toBe('Hello, world!')
    expect(result.validation).toEqual({ valid: true, issues: [] })
  })

  it('Cancellation: a cancellationRequested input short-circuits to cancelled without processing chunks', () => {
    const manager = createStreamingLifecycleManager()
    const result = manager.run(makeStreamingRunInputs({ cancellationRequested: true }))

    expect(result.status).toBe('cancelled')
    expect(result.session.state).toBe('cancelled')
    expect(result.assembledResponse).toBeNull()
    expect(result.diagnostics.chunksReceived).toBe(0)
  })

  it('Chunk Ordering / Chunk Buffering / Buffer Overflow: an over-capacity sequence fails with buffer-overflow', () => {
    const manager = createStreamingLifecycleManager()
    const result = manager.run(
      makeStreamingRunInputs({
        bufferPolicy: makeStreamBufferPolicy({ maxBufferedChunks: 1 }),
      }),
    )

    expect(result.status).toBe('failed')
    expect(result.validation.issues.some((issue) => issue.type === 'buffer-overflow')).toBe(true)
  })

  it('Chunk Ordering: a sequence with a gap fails with invalid-chunk-sequence / missing-chunk', () => {
    const manager = createStreamingLifecycleManager()
    const result = manager.run(
      makeStreamingRunInputs({
        chunks: [makeStreamChunk({ sequenceNumber: 0, content: 'A' }), makeStreamChunk({ sequenceNumber: 2, content: 'C', isFinal: true })],
      }),
    )

    expect(result.status).toBe('failed')
    expect(result.validation.issues.some((issue) => issue.type === 'missing-chunk')).toBe(true)
  })

  it('Completion Detection: a sequence with no final chunk fails with invalid-completion', () => {
    const manager = createStreamingLifecycleManager()
    const result = manager.run(
      makeStreamingRunInputs({
        chunks: [makeStreamChunk({ sequenceNumber: 0, content: 'A' }), makeStreamChunk({ sequenceNumber: 1, content: 'B' })],
      }),
    )

    expect(result.status).toBe('failed')
    expect(result.validation.issues.some((issue) => issue.type === 'invalid-completion')).toBe(true)
  })

  it('Response Assembly: diagnostics carries the partial response accumulated up to and including the overflowing chunk', () => {
    const manager = createStreamingLifecycleManager()
    const result = manager.run(
      makeStreamingRunInputs({
        bufferPolicy: makeStreamBufferPolicy({ maxBufferedChunks: 1 }),
      }),
    )

    expect(result.diagnostics.partialResponse).toBe('Hello, world!')
  })

  it('Diagnostics: Illegal Transition Handling: a stub state machine that always throws is caught and converted to invalid-lifecycle-transition', () => {
    const manager = createStreamingLifecycleManager({
      stateMachine: {
        transition: () => {
          throw new IllegalStreamingTransitionError('idle', 'starting')
        },
      },
    })

    const result = manager.run(makeStreamingRunInputs())

    expect(result.status).toBe('failed')
    expect(result.validation.issues.some((issue) => issue.type === 'invalid-lifecycle-transition')).toBe(true)
  })

  it('re-throws an unrecognized error from the state machine', () => {
    const manager = createStreamingLifecycleManager({
      stateMachine: {
        transition: () => {
          throw new Error('unexpected')
        },
      },
    })

    expect(() => manager.run(makeStreamingRunInputs())).toThrow('unexpected')
  })

  it('Determinism: two independently-constructed managers produce identical results for identical inputs', () => {
    const managerA = createStreamingLifecycleManager()
    const managerB = createStreamingLifecycleManager()
    const inputs = makeStreamingRunInputs()

    expect(managerA.run(inputs)).toEqual(managerB.run(inputs))
  })
})
