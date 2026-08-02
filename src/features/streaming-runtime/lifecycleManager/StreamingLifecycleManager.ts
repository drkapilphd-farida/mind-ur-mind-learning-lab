import type { StreamingRunInputs, StreamingRunResult } from '../types'

// One of the brief's own 10 named responsibilities — the single entry point
// driving one streaming session through its entire lifecycle: stream
// initialization, chunk reception/ordering/buffering/assembly, partial
// response generation, completion detection, cancellation, diagnostics.
// Processes the full, caller-supplied `chunks` array in one synchronous pass
// (no real waiting between chunks — see this feature's root `index.ts` for
// why). Never throws (catches its own known `IllegalStreamingTransitionError`,
// converts to `invalid-lifecycle-transition` failure data; anything else
// re-thrown — same scoping as `SessionLifecycleCoordinator.run()`).
export interface StreamingLifecycleManager {
  run(inputs: StreamingRunInputs): StreamingRunResult
}
