import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { loadUniversalLearningObject } from '@/features/learning-mode-runtime'
import { loadDocumentProcessingProgress, initializeDocumentProcessingProgress } from '@/features/learning-mode-runtime/persistence/documentProcessingProgress'
import { logger } from '@/lib/logger'

export type LegacyDocumentCandidate = {
  id: string
  userId: string
  status: string
}

export type LegacyRecoveryOutcome =
  | { documentId: string; outcome: 'recovered'; totalChunks: number }
  | { documentId: string; outcome: 'already-complete' }
  | { documentId: string; outcome: 'previously-failed-mid-pipeline' }
  | { documentId: string; outcome: 'no-ulo-nothing-to-recover' }
  | { documentId: string; outcome: 'skipped-not-terminal' }
  | { documentId: string; outcome: 'failed'; error: string }

// Flips `documents.status` directly via the SAME service-role client this
// module already reads with — deliberately NOT `markDocumentWorkspaceReady`
// (`@/services/documents`), which builds its own cookie-scoped client
// internally and is designed to act on behalf of one signed-in user's own
// document. Recovery is inherently cross-user (an admin/cron operation
// touching many different owners' documents), so it needs a real,
// unconditional service-role write here, the same way
// recoverAllLegacyDocuments already reads `documents` directly.
async function flipToWorkspaceReady(supabase: SupabaseClient<Database>, documentId: string): Promise<void> {
  const { error } = await supabase.from('documents').update({ status: 'workspace_ready' }).eq('id', documentId)
  if (error) throw new Error(`failed to flip document status to workspace_ready: ${error.message}`)
}

// Reading Intelligence Engine™ Upgrade — Sprint PIPELINE-1: Legacy
// Document Recovery & Background Processing™. Objective 1/10 — a real,
// idempotent, safely-repeatable recovery for documents that predate
// document_processing_progress's own existence (confirmed: 34 of this
// project's 38 real documents have documents.status = 'ready'/'failed'
// with genuinely zero document_processing_progress row — not stuck
// mid-stage, the row was simply never created, because the table itself
// didn't exist yet when they finished processing).
//
// Three real, distinct "already handled" states, not one — found by
// running this against real production data: a legacy document can (a)
// never have been touched (no progress row — the common case), (b)
// genuinely already be complete (a progress row with stage:'complete' —
// leave it alone, never reprocess), or (c) have a progress row from a
// PRIOR recovery attempt whose own status-flip step didn't finish (this
// function's own real, disclosed failure mode before this fix) — that
// last case must finish the flip, never re-initialize progress
// (initializeDocumentProcessingProgress is itself idempotent and would
// safely no-op, but re-running it isn't the actual remaining work).
// stage:'failed' (a genuine prior AI/processing failure, not a missing
// row) is surfaced as its own outcome rather than silently retried here
// — that is a different real problem from "never entered the pipeline,"
// and deserves its own investigation, not an automatic re-attempt.
//
// A document with no real Universal Learning Object is NOT stuck — see
// runQuickIntelligence.ts's own 'ready-no-ulo' outcome (no stored file,
// or a non-extractable source type). Recovery must never try to "fix" a
// document that was correctly, honestly marked ready with nothing
// further to process.
export async function recoverLegacyDocument(supabase: SupabaseClient<Database>, document: LegacyDocumentCandidate): Promise<LegacyRecoveryOutcome> {
  if (document.status !== 'ready' && document.status !== 'failed') {
    return { documentId: document.id, outcome: 'skipped-not-terminal' }
  }

  try {
    const existingProgress = await loadDocumentProcessingProgress(supabase, document.id)

    if (existingProgress !== null) {
      if (existingProgress.stage === 'complete') {
        return { documentId: document.id, outcome: 'already-complete' }
      }
      if (existingProgress.stage === 'failed') {
        return { documentId: document.id, outcome: 'previously-failed-mid-pipeline' }
      }
      await flipToWorkspaceReady(supabase, document.id)
      logger.info('[LegacyRecovery] finished an interrupted recovery — status flip completed', { documentId: document.id })
      return { documentId: document.id, outcome: 'recovered', totalChunks: existingProgress.totalChunks }
    }

    const ulo = await loadUniversalLearningObject(supabase, document.id)
    if (!ulo) {
      return { documentId: document.id, outcome: 'no-ulo-nothing-to-recover' }
    }

    const totalChunks = ulo.knowledge.chunks.length
    await initializeDocumentProcessingProgress(supabase, document.id, totalChunks)
    await flipToWorkspaceReady(supabase, document.id)

    logger.info('[LegacyRecovery] document handed back to Background Intelligence', { documentId: document.id, totalChunks })
    return { documentId: document.id, outcome: 'recovered', totalChunks }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error('[LegacyRecovery] unexpected exception recovering a legacy document', { documentId: document.id, error: message, stack: error instanceof Error ? error.stack : undefined })
    return { documentId: document.id, outcome: 'failed', error: message }
  }
}

// Real, service-role, cross-user scan — recovery is an administrative
// operation, not scoped to one signed-in user's own documents (unlike
// every RLS-scoped `services/documents` function). Callers (the admin
// dev-tool action, the cron-callable batch route) are responsible for
// their own authorization; this function trusts the client it's given.
export async function recoverAllLegacyDocuments(supabase: SupabaseClient<Database>): Promise<readonly LegacyRecoveryOutcome[]> {
  const { data, error } = await supabase.from('documents').select('id, user_id, status').in('status', ['ready', 'failed'])

  if (error) {
    logger.error('[LegacyRecovery] failed to list candidate documents', { error: error.message })
    return []
  }

  const outcomes: LegacyRecoveryOutcome[] = []
  for (const row of data ?? []) {
    const outcome = await recoverLegacyDocument(supabase, { id: row.id, userId: row.user_id, status: row.status })
    outcomes.push(outcome)
  }
  return outcomes
}
