import type { StreamBufferAppendResult, StreamBufferPolicy, StreamBufferState, StreamChunk } from '../types'

// One of the brief's own 10 named responsibilities ("chunk buffering").
// Pure — never mutates `state`; always returns a brand-new `StreamBufferState`.
// Never refuses to append or throws on overflow — it only reports
// `overflowed: boolean` and lets the caller (the lifecycle manager) decide
// what to do, matching the arc's "validation results over exceptions" rule.
export interface StreamBuffer {
  append(state: StreamBufferState, chunk: StreamChunk, policy: StreamBufferPolicy): StreamBufferAppendResult
}
