import type { StreamingDiagnostics } from './StreamingDiagnostics'
import type { StreamingSession } from './StreamingSession'
import type { StreamingValidation } from './StreamingValidation'

// The terminal result of `StreamingLifecycleManager.run()` / `StreamingRuntimeEngine.run()`.
// `assembledResponse` is `null` for any non-`completed` status — it is only ever
// populated by `StreamAssembler.assembleFinalResponse` after a validated completion.
export type StreamingRunResult = {
  readonly session: StreamingSession
  readonly status: 'completed' | 'cancelled' | 'failed'
  readonly assembledResponse: string | null
  readonly diagnostics: StreamingDiagnostics
  readonly validation: StreamingValidation
}
