import type { StreamingState } from './StreamingState'
import type { StreamingValidation } from './StreamingValidation'

// One of the brief's own 10 named responsibilities ("stream diagnostics").
// `partialResponse` is genuinely wired from the fold in
// `DefaultStreamingLifecycleManager.run()` (via `StreamAssembler.assemblePartialResponse`),
// not a placeholder field.
export type StreamingDiagnostics = {
  readonly sessionId: string
  readonly state: StreamingState
  readonly chunksReceived: number
  readonly bufferedChunkCount: number
  readonly partialResponse: string
  readonly assembledLength: number
  readonly validation: StreamingValidation
}
