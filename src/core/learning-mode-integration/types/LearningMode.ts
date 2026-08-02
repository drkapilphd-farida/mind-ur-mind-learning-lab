import type { LearningModeType, RuntimeModeAdapter } from '@/core/adaptive-learning-runtime'
import type { LearningModeCapabilities } from './LearningModeCapabilities'

// Learning Mode Runtime Integration™ (LSE-4). The one consolidated
// plug-in contract every Learning Mode implements. `adapter` reuses LSE-2's
// own `RuntimeModeAdapter` verbatim — LSE-2 already reserved the real hook
// shape (`onRuntimeStarted`, `onChunkStarted`, `onChunkCompleted`,
// `onChunkSkipped`, `onChunkRepeated`, `onChunkMarkedForRevisit`,
// `onCheckpointReached`, `onRuntimeCompleted`); this layer's real
// contribution is the registry, dispatch, capability validation, and
// progress synchronization built around that already-reserved shape, never
// a second, competing hook interface. `adapter` is optional — a mode with
// no real callbacks yet (or ever) is still a fully legitimate, registrable
// Learning Mode.
export type LearningMode = {
  type: LearningModeType
  capabilities: LearningModeCapabilities
  adapter?: RuntimeModeAdapter
}
