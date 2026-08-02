import type { AdaptiveRuntimeState } from '@/core/adaptive-learning-runtime'
import type { RuntimeMetrics } from './types/RuntimeMetrics'

// Learning Session Runtime™ (LSE-3). Pure. The ONE shared implementation of
// the real, mode-agnostic metrics model — every field is read or summed from
// data `AdaptiveRuntimeState` already carries (`progress.skippedCount`/
// `revisitCount` reused verbatim, never recounted from `skippedChunkIds`/
// `revisitChunkIds` independently; `eventLog` scanned once for real
// `runtime-paused`/`checkpoint-reached` counts).
export function computeRuntimeMetrics(runtime: AdaptiveRuntimeState): RuntimeMetrics {
  const totalRepeats = Object.values(runtime.repeatCounts).reduce((sum, count) => sum + count, 0)
  const pauseCount = runtime.eventLog.filter((event) => event.type === 'runtime-paused').length
  const checkpointCount = runtime.eventLog.filter((event) => event.type === 'checkpoint-reached').length

  return {
    totalChunks: runtime.scheduledQueue.items.length,
    completedChunks: runtime.progress.completedChunkIds.length,
    skippedChunks: runtime.progress.skippedCount,
    revisitedChunks: runtime.progress.revisitCount,
    totalRepeats,
    pauseCount,
    checkpointCount,
  }
}
