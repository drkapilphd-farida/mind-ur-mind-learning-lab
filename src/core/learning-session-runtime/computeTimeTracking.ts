import type { RuntimeEvent } from '@/core/adaptive-learning-runtime'
import type { ChunkTimeRecord, TimeTrackingSummary } from './types/TimeTracking'

// Learning Session Runtime™ (LSE-3). Pure. The ONE shared implementation of
// Time Tracking — a single pass over a real `AdaptiveRuntimeState.eventLog`,
// pairing each real `chunk-started` with its real `chunk-completed`/
// `chunk-skipped` (each chunk gets exactly one `chunk-started` — LSE-2's own
// `repeatChunk` re-emits `chunk-repeated`, never a second `chunk-started`,
// so no chunk can appear twice here) and each real `runtime-paused` with its
// real `runtime-resumed`. A currently open chunk or open pause interval is
// left honestly unresolved (`endedAt`/`activeSeconds` null, or simply not
// counted in `totalPausedSeconds`) rather than estimated against an assumed
// "now."
export function computeTimeTracking(eventLog: readonly RuntimeEvent[]): TimeTrackingSummary {
  const startedAtByChunkId = new Map<string, string>()
  const chunkTimes: ChunkTimeRecord[] = []
  let openPauseStartedAt: string | null = null
  let totalPausedSeconds = 0
  let sessionStartedAt: string | null = null
  let sessionEndedAt: string | null = null

  for (const event of eventLog) {
    if (event.type === 'chunk-started') {
      if (sessionStartedAt === null) sessionStartedAt = event.occurredAt
      startedAtByChunkId.set(event.chunkNodeId, event.occurredAt)
      continue
    }

    if (event.type === 'chunk-completed' || event.type === 'chunk-skipped') {
      const startedAt = startedAtByChunkId.get(event.chunkNodeId)
      if (startedAt !== undefined) {
        startedAtByChunkId.delete(event.chunkNodeId)
        const activeSeconds = (new Date(event.occurredAt).getTime() - new Date(startedAt).getTime()) / 1000
        chunkTimes.push({ chunkNodeId: event.chunkNodeId, startedAt, endedAt: event.occurredAt, activeSeconds })
      }
      continue
    }

    if (event.type === 'runtime-paused') {
      openPauseStartedAt = event.occurredAt
      continue
    }

    if (event.type === 'runtime-resumed') {
      if (openPauseStartedAt !== null) {
        totalPausedSeconds += (new Date(event.occurredAt).getTime() - new Date(openPauseStartedAt).getTime()) / 1000
        openPauseStartedAt = null
      }
      continue
    }

    if (event.type === 'runtime-completed') {
      sessionEndedAt = event.occurredAt
    }
  }

  for (const [chunkNodeId, startedAt] of startedAtByChunkId) {
    chunkTimes.push({ chunkNodeId, startedAt, endedAt: null, activeSeconds: null })
  }

  const totalActiveSeconds = chunkTimes.reduce((sum, record) => sum + (record.activeSeconds ?? 0), 0)

  return { chunkTimes, totalActiveSeconds, totalPausedSeconds, sessionStartedAt, sessionEndedAt }
}
