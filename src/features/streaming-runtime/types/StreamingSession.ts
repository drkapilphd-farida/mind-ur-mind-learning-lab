import type { StreamBufferState } from './StreamBufferState'
import type { StreamingState } from './StreamingState'

// `id` is caller-supplied (same discipline as `AIExecutionSessionContext`'s
// learnerId/profileId) — no IdGenerator anywhere in this feature.
export type StreamingSession = {
  readonly id: string
  readonly state: StreamingState
  readonly bufferState: StreamBufferState
}
