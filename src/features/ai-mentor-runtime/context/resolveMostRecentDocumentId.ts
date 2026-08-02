import type { SessionSnapshot } from '@/core/learning-session-runtime'

// AI Mentor™ Sprint ALS-21 — Complete Functional Completion. Pure. The
// real, already-fetched Reading/Memory/Smart-Notes snapshot lists
// (`buildMentorSessionContext.ts` already loads these for its own
// profile figures) each carry a real `documentId` and a real, honest
// `capturedAt` timestamp — this just finds whichever one is most recent
// across all three lists, so AI Mentor™ can ground itself in the
// learner's own most recently active document. Returns `null`,
// honestly, when the learner has no real sessions of any kind yet —
// never a guessed default.
export function resolveMostRecentDocumentId(...snapshotLists: readonly (readonly SessionSnapshot[])[]): string | null {
  const allSnapshots = snapshotLists.flat()
  if (allSnapshots.length === 0) return null

  let mostRecent = allSnapshots[0] as SessionSnapshot
  for (const snapshot of allSnapshots) {
    if (new Date(snapshot.capturedAt).getTime() > new Date(mostRecent.capturedAt).getTime()) {
      mostRecent = snapshot
    }
  }

  return mostRecent.documentId
}
