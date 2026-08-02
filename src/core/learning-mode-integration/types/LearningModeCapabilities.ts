import type { SessionType } from '@/core/universal-learning-engine/universal-learning-object'
import type { ChunkStrategy } from '@/core/adaptive-learning-runtime'

// Learning Mode Runtime Integration™ (LSE-4). Capability registration —
// what a Learning Mode declares about itself, generically, with no mode-
// specific meaning attached to any field. `sessionType` reuses the ULO's
// own `SessionType` verbatim (never a duplicate enum); `supportedChunkStrategies`
// reuses LSE-2's own 5 real `ChunkStrategy` values verbatim — this layer
// never invents a 6th strategy or a parallel notion of one.
export type LearningModeCapabilities = {
  sessionType: SessionType
  supportedChunkStrategies: readonly ChunkStrategy[]
  supportsCheckpoints: boolean
}
