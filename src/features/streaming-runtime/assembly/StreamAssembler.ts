import type { StreamChunk } from '../types'

// One of the brief's own 10 named responsibilities — covers both "chunk
// assembly" and "partial response generation" as two distinct methods on one
// interface, since both are the exact same join-by-sequenceNumber operation,
// just called at different points in the lifecycle (after every chunk vs.
// once at completion).
export interface StreamAssembler {
  assemblePartialResponse(chunks: readonly StreamChunk[]): string
  assembleFinalResponse(chunks: readonly StreamChunk[]): string
}
