'use server'

// Production AI Cost Optimization — Task 4. A real, callable Server
// Action for document deletion — backend capability only, per the
// founder's own explicit scope decision (no delete button/UI flow wired
// up this pass). Thin by design, per docs/adr/0002-domain-layered-
// architecture.md: all real logic lives in services/documents'
// `deleteDocument`, re-exported through api/documents.
//
// ALS-15 Instant Learning Engine™ — `pollBackgroundProcessing` below can
// take up to ~30-35s in the worst case (one enrichment batch's timeout).
// No `maxDuration`/serverless execution-limit config exists anywhere in
// this codebase and the deploy target is unconfirmed — a `'use server'`
// file cannot itself export a route-segment `maxDuration` (only
// page/layout/route files can), so this is a real, disclosed risk to
// confirm against the actual hosting platform, not something fixable
// here.

import { z } from 'zod'
import { deleteDocument, getDocument } from '@/api/documents'
import { advanceBackgroundProcessing } from '@/lib/processing/advanceBackgroundProcessing'
import { loadDocumentProcessingProgress } from '@/features/learning-mode-runtime/persistence/documentProcessingProgress'
import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import type { DocumentStatus } from '@/types/documents'

const DeleteDocumentSchema = z.object({
  documentId: z.string().uuid(),
})

export type DeleteLearningProjectDocumentResult = { success: true } | { success: false; error: string }

export async function deleteLearningProjectDocument(documentId: string): Promise<DeleteLearningProjectDocumentResult> {
  const parsed = DeleteDocumentSchema.safeParse({ documentId })
  if (!parsed.success) {
    return { success: false, error: 'This document could not be found.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'You must be signed in to continue.' }
  }

  return deleteDocument(user.id, parsed.data.documentId)
}

const PollSchema = z.object({
  documentId: z.string().uuid(),
})

export type BackgroundProcessingSnapshot = {
  status: DocumentStatus
  stage: 'enriching_chunks' | 'building_knowledge_graph' | 'building_learning_analysis' | 'generating_blueprints' | 'generating_learning_assets' | 'complete' | 'failed'
  totalChunks: number
  chunksEnriched: number
  knowledgeGraphDone: boolean
  learningAnalysisDone: boolean
  totalChapters: number
  blueprintsGenerated: number
  learningAssetsGenerated: number
  errorMessage: string | null
}

export type PollBackgroundProcessingResult = { success: true; snapshot: BackgroundProcessingSnapshot } | { success: false; error: string }

function toSnapshot(status: DocumentStatus, progress: Awaited<ReturnType<typeof loadDocumentProcessingProgress>>): BackgroundProcessingSnapshot {
  if (!progress) {
    return {
      status,
      stage: 'complete',
      totalChunks: 0,
      chunksEnriched: 0,
      knowledgeGraphDone: true,
      learningAnalysisDone: true,
      totalChapters: 0,
      blueprintsGenerated: 0,
      learningAssetsGenerated: 0,
      errorMessage: null,
    }
  }
  return {
    status,
    stage: progress.stage,
    totalChunks: progress.totalChunks,
    chunksEnriched: progress.chunksEnriched,
    knowledgeGraphDone: progress.knowledgeGraphDone,
    learningAnalysisDone: progress.learningAnalysisDone,
    totalChapters: progress.totalChapters,
    blueprintsGenerated: progress.blueprintsGenerated,
    learningAssetsGenerated: progress.learningAssetsGenerated,
    errorMessage: progress.errorMessage,
  }
}

// ALS-15 Instant Learning Engine™ — the one action the client polls while
// a document sits at `'workspace_ready'`. Both reports progress AND
// advances Phase 3 "Background AI Intelligence" by one bounded unit per
// call (the approved, zero-new-infrastructure "client-paced poll/pump"
// design) — never does anything once the document is already
// `'ready'`/`'failed'`, so a poll landing after completion costs nothing.
export async function pollBackgroundProcessing(documentId: string): Promise<PollBackgroundProcessingResult> {
  const parsed = PollSchema.safeParse({ documentId })
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

    if (document.status === 'ready' || document.status === 'failed') {
      const serviceClient = createServiceClient()
      const progress = await loadDocumentProcessingProgress(serviceClient, document.id)
      return { success: true, snapshot: toSnapshot(document.status, progress) }
    }

    if (document.status !== 'workspace_ready') {
      return { success: false, error: 'This document is not ready for background processing yet.' }
    }

    const result = await advanceBackgroundProcessing(document)

    if (result.outcome === 'advanced' || result.outcome === 'complete') {
      const refreshedDocument = await getDocument(user.id, parsed.data.documentId)
      return { success: true, snapshot: toSnapshot(refreshedDocument?.status ?? document.status, result.progress) }
    }

    // 'no-progress' / 'skipped-locked' / 'failed' — in every case the
    // real, current progress row (already updated by
    // advanceBackgroundProcessing itself on a real failure) is the
    // honest source of truth to report back; the poller just tries
    // again next tick.
    const serviceClient = createServiceClient()
    const progress = await loadDocumentProcessingProgress(serviceClient, document.id)
    return { success: true, snapshot: toSnapshot(document.status, progress) }
  } catch (error) {
    // ALS-15.1 Production Debug Sprint™ — never let an unexpected
    // exception propagate uncaught out of this Server Action; log the
    // real failure server-side instead.
    logger.error('[BackgroundIntelligence] pollBackgroundProcessing — FAIL (uncaught exception at the Server Action boundary)', {
      documentId: parsed.data.documentId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return { success: false, error: 'We hit a snag checking on your document. Please try again.' }
  }
}
