import type { StreamBufferState } from './StreamBufferState'

// Returned by `StreamBuffer.append` — the new immutable state plus whether
// this append pushed the buffer past `StreamBufferPolicy`'s limits. The
// lifecycle manager decides what to do with `overflowed`; the buffer itself
// never throws or refuses to append.
export type StreamBufferAppendResult = {
  readonly state: StreamBufferState
  readonly overflowed: boolean
}
