import type { StreamBufferPolicy } from './StreamBufferPolicy'
import type { StreamChunk } from './StreamChunk'

// The single input to `StreamingLifecycleManager.run()` / `StreamingRuntimeEngine.run()`.
// `chunks` is the *full*, ordered, caller-supplied sequence for the whole
// session — this arc never processes a stream across multiple calls (no real
// waiting between chunks), so there is no separate "receive one chunk" entrypoint.
export type StreamingRunInputs = {
  readonly sessionId: string
  readonly chunks: readonly StreamChunk[]
  readonly bufferPolicy: StreamBufferPolicy
  readonly cancellationRequested: boolean
}
