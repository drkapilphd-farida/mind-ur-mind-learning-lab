import type { RuntimeDiagnostics } from './RuntimeDiagnostics'
import type { RuntimeState } from './RuntimeState'
import type { RuntimeSuccessResult } from './RuntimeSuccessResult'

// Immutable — every field `readonly`. The brief's own "RuntimeResult"
// responsibility, renamed — a real, exact collision found via
// repo-wide grep with
// `src/hooks/exercise-engine/useUniversalExerciseRuntime.ts` (an
// unrelated exercise-runtime hook). Renamed to echo this sprint's own
// feature name. `AIRuntimeOrchestrator.run()`'s own output — always
// returned, regardless of how many stages failed; never a thrown
// exception.
export type AIRuntimeResult = {
  readonly state: RuntimeState
  readonly completionStatus: 'completed' | 'failed'
  readonly success: RuntimeSuccessResult | null
  readonly failureReason: string | null
  readonly diagnostics: RuntimeDiagnostics
}
