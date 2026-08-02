import type { AdaptiveRuntimeState } from '@/core/adaptive-learning-runtime'
import { computeRuntimeMetrics } from '@/core/learning-session-runtime'
import type { LearningMode } from './types/LearningMode'
import type { SynchronizedModeProgress } from './types/SynchronizedModeProgress'

// Learning Mode Runtime Integration™ (LSE-4). Progress synchronization.
// Pure. The ONE shared implementation — combines LSE-2's own real
// `runtime.progress` with LSE-3's own real `computeRuntimeMetrics(runtime)`
// under the mode's real identity. Neither value is recomputed
// independently; this function only assembles two already-real sources
// into one on-demand view a mode's own Server Action can pull whenever it
// needs a synchronized snapshot.
export function synchronizeModeProgress(mode: LearningMode, runtime: AdaptiveRuntimeState): SynchronizedModeProgress {
  return {
    mode: mode.type,
    progress: runtime.progress,
    metrics: computeRuntimeMetrics(runtime),
  }
}
