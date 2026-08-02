import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type { SessionType } from '@/core/universal-learning-engine/universal-learning-object'
import { createSupabaseSessionPersistenceAdapter } from '@/features/learning-mode-runtime'
import { aggregateRevisionContext } from './aggregateRevisionContext'

export type DocumentRevisionContext = {
  hasHistory: boolean
  skippedCount: number
  revisitedCount: number
}

// Revision Mode™ — AI Learning Studio™ Sprint ALS-17. Founder-confirmed
// (via AskUserQuestion): a real, honest summary of what the learner
// actually skipped or revisited across their own past sessions on this
// document — purely informational, never used to filter or reorder
// chunks (that would touch the core scheduling engine; this doesn't).
//
// This is genuinely new code, not just reuse — no existing function
// aggregates session history across modes for one document (confirmed by
// investigation ahead of this sprint: `listByLearner` is scoped to one
// mode and every document; `findModeSessionForDocument` is scoped to one
// mode and the single most recent session). Composed entirely from
// already-real, already-established primitives: the same
// `createSupabaseSessionPersistenceAdapter`/`listByLearner` pair AI
// Mentor™'s own `buildMentorSessionContext.ts` already uses to aggregate
// across modes, just also filtered to one `documentId` (`SessionSnapshot`
// already carries `documentId` — no new field needed) and folded down
// into real, deduplicated counts of `skippedChunkIds`/`revisitChunkIds`
// across every one of those sessions. `mcqs`/`revision` are deliberately
// excluded from the modes scanned — a learner's own MCQs/Revision history
// isn't "what they skipped while learning the material," it would be
// circular.
export async function getDocumentRevisionContext(supabase: SupabaseClient<Database>, learnerId: string, documentId: string): Promise<DocumentRevisionContext> {
  const modesToScan: readonly SessionType[] = ['reading', 'memory', 'smart-notes', 'focus']

  const snapshotLists = await Promise.all(modesToScan.map((sessionType) => createSupabaseSessionPersistenceAdapter(supabase, learnerId, sessionType).listByLearner(learnerId)))

  const relevantSnapshots = snapshotLists.flat().filter((snapshot) => snapshot.documentId === documentId)

  return aggregateRevisionContext(relevantSnapshots)
}
