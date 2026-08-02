import type { StreamChunk } from './StreamChunk'

// Immutable snapshot produced by `StreamBuffer.append` — every "append"
// operation returns a brand-new `StreamBufferState`, never mutates one in place.
export type StreamBufferState = {
  readonly chunks: readonly StreamChunk[]
  readonly totalContentLength: number
}
