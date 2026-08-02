import type { StreamingRunInputs, StreamingRunResult } from '../types'

// Two of the brief's own 10 named responsibilities
// (`StreamingRuntimeEngine`/`DefaultStreamingRuntimeEngine`) — the stable
// public entrypoint and factory-DI seam for this feature, mirroring exactly
// how `AIRuntimeOrchestrator` (Sprint 41) wraps `RuntimeCoordinator`. A thin
// facade over `StreamingLifecycleManager` — carries no logic of its own.
export interface StreamingRuntimeEngine {
  run(inputs: StreamingRunInputs): StreamingRunResult
}
