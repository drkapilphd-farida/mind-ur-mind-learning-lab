import type { StreamChunk, StreamingDiagnostics, StreamingSession, StreamingValidation } from '../types'

// One of the brief's own 10 named responsibilities ("stream diagnostics").
// Pure — every field is derived directly from its inputs, no hidden state.
export function generateStreamingDiagnostics(
  session: StreamingSession,
  chunksReceived: readonly StreamChunk[],
  partialResponse: string,
  validation: StreamingValidation,
): StreamingDiagnostics {
  return {
    sessionId: session.id,
    state: session.state,
    chunksReceived: chunksReceived.length,
    bufferedChunkCount: session.bufferState.chunks.length,
    partialResponse,
    assembledLength: partialResponse.length,
    validation,
  }
}
