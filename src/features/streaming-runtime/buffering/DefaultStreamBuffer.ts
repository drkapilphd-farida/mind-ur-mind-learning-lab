import type { StreamBufferAppendResult, StreamBufferPolicy, StreamBufferState, StreamChunk } from '../types'
import type { StreamBuffer } from './StreamBuffer'

export class DefaultStreamBuffer implements StreamBuffer {
  append(state: StreamBufferState, chunk: StreamChunk, policy: StreamBufferPolicy): StreamBufferAppendResult {
    const nextState: StreamBufferState = {
      chunks: [...state.chunks, chunk],
      totalContentLength: state.totalContentLength + chunk.content.length,
    }

    const overflowed =
      nextState.chunks.length > policy.maxBufferedChunks ||
      nextState.totalContentLength > policy.maxBufferedContentLength

    return { state: nextState, overflowed }
  }
}

export function createStreamBuffer(): StreamBuffer {
  return new DefaultStreamBuffer()
}
