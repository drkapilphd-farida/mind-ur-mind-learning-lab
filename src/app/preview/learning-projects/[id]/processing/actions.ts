'use server'

// Server Actions for the AI Processing Experience™. Thin by design, per
// docs/adr/0002-domain-layered-architecture.md: delegates to
// api/documents + lib/processing, does nothing else.
//
// ALS-15 Instant Learning Engine™ — replaces the old
// `finalizeLearningProjectProcessing`/`verifyDocumentUpload` pair (which
// ran the entire pipeline, AI calls included, in one blocking call) with
// one fast, zero-AI Phase 1 "Quick Intelligence" action. Phase 3
// "Background AI Intelligence" is driven separately, from the workspace
// page, via `pollBackgroundProcessing` (see `../actions.ts`).

import { z } from 'zod'
import { getDocument } from '@/api/documents'
import { runQuickIntelligence, applyQuickIntelligenceOutcome } from '@/lib/processing/runQuickIntelligence'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

const Phase1Schema = z.object({
  documentId: z.string().uuid(),
})

export type Phase1Result = { success: true } | { success: false; error: string }

// Phase 1 "Quick Intelligence" — target ≤30s, zero AI calls: validate,
// parse, chunk, build a structural Learning Blueprint, mark the document
// workspace-ready. The workspace opens the instant this resolves.
//
// ALS-15.1 Production Debug Sprint™ — wrapped in a real try/catch: before
// this fix, an unexpected exception anywhere in this action's own
// guards (e.g. `getDocument` throwing on a real Supabase/RLS error) would
// propagate uncaught out of a Server Action, surfacing as Next.js's own
// generic error boundary instead of this app's friendly processing-error
// card — and, worse, with nothing logged server-side to explain why.
export async function runPhase1QuickIntelligence(documentId: string): Promise<Phase1Result> {
  const parsed = Phase1Schema.safeParse({ documentId })
  if (!parsed.success) {
    return { success: false, error: 'This document could not be found.' }
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'You must be signed in to continue.' }
    }

    const document = await getDocument(user.id, parsed.data.documentId)
    if (!document) {
      return { success: false, error: 'This document could not be found.' }
    }

    if (document.status !== 'processing') {
      // Already advanced past Phase 1 (a re-visit, a duplicate call) —
      // treat as success so the client simply moves on to the workspace.
      return { success: true }
    }

    const result = await runQuickIntelligence(supabase, document)
    return await applyQuickIntelligenceOutcome(user.id, parsed.data.documentId, result)
  } catch (error) {
    logger.error('[QuickIntelligence] runPhase1QuickIntelligence — FAIL (uncaught exception at the Server Action boundary)', {
      documentId: parsed.data.documentId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return { success: false, error: 'We hit a snag preparing your Learning Project. Please try again.' }
  }
}
