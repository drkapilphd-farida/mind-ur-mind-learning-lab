import { describe, expect, it } from 'vitest'
import type { StreamBufferPolicy, StreamBufferState, StreamChunk } from '../types'
import { createStreamBuffer } from './DefaultStreamBuffer'

const EMPTY_STATE: StreamBufferState = { chunks: [], totalContentLength: 0 }
const GENEROUS_POLICY: StreamBufferPolicy = { maxBufferedChunks: 10, maxBufferedContentLength: 1000 }

function chunk(sequenceNumber: number, content: string, isFinal = false): StreamChunk {
  return { sequenceNumber, content, isFinal }
}

describe('DefaultStreamBuffer', () => {
  it('Chunk Buffering: accumulates chunks and content length across appends', () => {
    const buffer = createStreamBuffer()

    const first = buffer.append(EMPTY_STATE, chunk(0, 'hel'), GENEROUS_POLICY)
    expect(first.state.chunks).toEqual([chunk(0, 'hel')])
    expect(first.state.totalContentLength).toBe(3)
    expect(first.overflowed).toBe(false)

    const second = buffer.append(first.state, chunk(1, 'lo'), GENEROUS_POLICY)
    expect(second.state.chunks).toEqual([chunk(0, 'hel'), chunk(1, 'lo')])
    expect(second.state.totalContentLength).toBe(5)
    expect(second.overflowed).toBe(false)
  })

  it('does not mutate the input state object', () => {
    const buffer = createStreamBuffer()
    const before = { ...EMPTY_STATE }

    buffer.append(EMPTY_STATE, chunk(0, 'x'), GENEROUS_POLICY)

    expect(EMPTY_STATE).toEqual(before)
  })

  it('Buffer Overflow: overflowed is true once maxBufferedChunks is exceeded', () => {
    const buffer = createStreamBuffer()
    const policy: StreamBufferPolicy = { maxBufferedChunks: 1, maxBufferedContentLength: 1000 }

    const first = buffer.append(EMPTY_STATE, chunk(0, 'a'), policy)
    expect(first.overflowed).toBe(false)

    const second = buffer.append(first.state, chunk(1, 'b'), policy)
    expect(second.overflowed).toBe(true)
  })

  it('Buffer Overflow: overflowed is true once maxBufferedContentLength is exceeded', () => {
    const buffer = createStreamBuffer()
    const policy: StreamBufferPolicy = { maxBufferedChunks: 10, maxBufferedContentLength: 3 }

    const result = buffer.append(EMPTY_STATE, chunk(0, 'abcd'), policy)
    expect(result.overflowed).toBe(true)
  })

  it('Determinism: two independently-constructed buffers produce identical results', () => {
    const bufferA = createStreamBuffer()
    const bufferB = createStreamBuffer()

    expect(bufferA.append(EMPTY_STATE, chunk(0, 'x'), GENEROUS_POLICY)).toEqual(
      bufferB.append(EMPTY_STATE, chunk(0, 'x'), GENEROUS_POLICY),
    )
  })
})
