import type { LearningModeType, RuntimeProgress } from '@/core/adaptive-learning-runtime'
import type { RuntimeMetrics } from '@/core/learning-session-runtime'

// Learning Mode Runtime Integration™ (LSE-4). Progress synchronization —
// the combined, real, on-demand view a registered mode's own Server Action
// pulls whenever it needs a synchronized progress snapshot. `progress`
// reuses LSE-2's own `RuntimeProgress` verbatim; `metrics` reuses LSE-3's
// own `RuntimeMetrics` verbatim — this layer computes neither independently,
// it only combines the two already-real sources under one real mode
// identity.
export type SynchronizedModeProgress = {
  mode: LearningModeType
  progress: RuntimeProgress
  metrics: RuntimeMetrics
}
