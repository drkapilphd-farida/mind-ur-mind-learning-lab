'use server'

import { createClient } from '@/lib/supabase/server'
import { listDocuments } from '@/services/documents'
import { advanceBackgroundProcessing } from '@/lib/processing/advanceBackgroundProcessing'
import { runQuickIntelligence, applyQuickIntelligenceOutcome } from '@/lib/processing/runQuickIntelligence'
import { logger } from '@/lib/logger'

export type PollAllInFlightProcessingResult = { success: true; advancedCount: number; inFlightCount: number } | { success: false; error: string }

// Reading Intelligence Engine™ Upgrade — Sprint PIPELINE-1: Legacy
// Document Recovery & Background Processing™. Objective 2 — broadens
// WHERE processing can advance from (previously only the one specific
// project's own detail page) without changing HOW it advances: this
// calls the exact same, unmodified advanceBackgroundProcessing every
// other trigger already uses, so the existing per-document lock
// (claimDocumentProcessingProgressLock) already makes it safe to call
// from here too, concurrently with the existing per-project poller, with
// no new locking required. Scoped to the signed-in user's own documents
// only (listDocuments is already RLS-scoped) — this is a broader trigger
// surface, not a privileged one.
//
// Sprint PIPELINE-2 — Upload Reliability & Processing Fix™. Real root
// cause found: runQuickIntelligence (Phase 1) was ONLY ever called from
// ProcessingExperience.tsx's own useEffect — the instant a learner
// navigated away from that one screen before it finished (closed the
// tab, hit back, lost connectivity), the document was permanently stuck
// at status:'processing' forever, with zero automatic retry anywhere in
// the app. Confirmed against real, live data: several real documents
// sitting at status:'processing' with updated_at === created_at (the
// status-flip write never happened). This function now also recovers
// those — reusing the exact same, already-proven runQuickIntelligence/
// applyQuickIntelligenceOutcome the Processing page itself calls, safe to
// re-run unconditionally because runQuickIntelligence's own idempotency
// check (an existing ULO means Phase 1 already did its real work) skips
// straight to retrying only the status write for a document that got
// that far before being interrupted.
export async function pollAllInFlightProcessing(): Promise<PollAllInFlightProcessingResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not signed in.' }

    const documents = await listDocuments(user.id)
    const stuckAtPhase1 = documents.filter((document) => document.status === 'processing')
    const inFlight = documents.filter((document) => document.status === 'workspace_ready')

    let advancedCount = 0

    for (const document of stuckAtPhase1) {
      const result = await runQuickIntelligence(supabase, document)
      const applied = await applyQuickIntelligenceOutcome(user.id, document.id, result)
      if (applied.success && result.outcome !== 'failed') advancedCount += 1
    }

    for (const document of inFlight) {
      const result = await advanceBackgroundProcessing(document)
      if (result.outcome === 'advanced' || result.outcome === 'complete') advancedCount += 1
    }

    return { success: true, advancedCount, inFlightCount: inFlight.length + stuckAtPhase1.length }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error('pollAllInFlightProcessing failed', { error: message })
    return { success: false, error: 'We could not check your document processing right now.' }
  }
}
