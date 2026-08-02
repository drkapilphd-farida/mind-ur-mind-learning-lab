import type { SessionSnapshot } from '@/core/learning-session-runtime'
import type { DocumentRevisionContext } from './getDocumentRevisionContext'

// Revision Mode™ — AI Learning Studio™ Sprint ALS-17. The pure part of
// `getDocumentRevisionContext.ts`, extracted for real unit testing — the
// same "extract the pure aggregation, leave the Supabase fetch
// untested-in-isolation" pattern AI Mentor's own
// `computeDaysSinceLastSession.ts` already established. Real, deduplicated
// counts only — a chunk skipped in two different past sessions still
// counts once, since the learner only needs to know it's a real gap,
// not how many times it was one.
export function aggregateRevisionContext(snapshots: readonly SessionSnapshot[]): DocumentRevisionContext {
  const skippedChunkIds = new Set<string>()
  const revisitedChunkIds = new Set<string>()

  for (const snapshot of snapshots) {
    for (const chunkId of snapshot.skippedChunkIds) skippedChunkIds.add(chunkId)
    for (const chunkId of snapshot.revisitChunkIds) revisitedChunkIds.add(chunkId)
  }

  return {
    hasHistory: snapshots.length > 0,
    skippedCount: skippedChunkIds.size,
    revisitedCount: revisitedChunkIds.size,
  }
}
