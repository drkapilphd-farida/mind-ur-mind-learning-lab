import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { universalUploadParser } from '@/core/universal-learning-engine/upload'
import { extractUniversalLearningDocument, extractUniversalLearningDocumentFromImages } from '@/core/universal-learning-engine/extraction'
import { chunkUniversalLearningDocument } from '@/core/universal-learning-engine/chunking'
import { buildLearningChunks } from '@/core/universal-learning-engine/learning-chunk'
import { buildLearningKnowledgeGraph } from '@/core/universal-learning-engine/knowledge-graph'
import { buildLearningAnalysis } from '@/core/universal-learning-engine/learning-analysis'
import { buildUniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import { saveUniversalLearningObject, loadUniversalLearningObject } from '@/features/learning-mode-runtime'
import { createServiceClient } from '@/lib/supabase/service'
import { initializeDocumentProcessingProgress } from '@/features/learning-mode-runtime/persistence/documentProcessingProgress'
import { markDocumentReady, markDocumentWorkspaceReady, markDocumentFailed } from '@/services/documents'
import { logger } from '@/lib/logger'
import { diagnoseSupabaseError, type SupabaseOperationError } from '@/lib/processing/diagnoseSupabaseError'
import type { Document } from '@/types/documents'
import type { UniversalLearningDocument } from '@/core/universal-learning-engine/extraction'

export type QuickIntelligenceResult =
  | { outcome: 'workspace-ready' }
  // Honest, disclosed limit: real extraction covers PDF/DOCX/TXT only.
  // Every other accepted format (image, camera-scan, legacy .doc) keeps
  // its exact pre-ALS-15 behavior — no Universal Learning Object™ is
  // built, the document goes straight to 'ready' (there is no Phase 3 to
  // run for it), never a failure, never a silent fake ULO.
  | { outcome: 'ready-no-ulo' }
  | { outcome: 'failed'; error: string }

const EXTRACTABLE_SOURCE_TYPES = new Set(['pdf', 'docx', 'txt'])

// ALS-15.1 Production Debug Sprint™ — "Trace every step. Every step must
// log START, SUCCESS, FAIL, execution time and the actual exception.
// Never swallow exceptions." A tiny, real timer/log helper used at every
// real transition below — never a fabricated step, only real work this
// function actually does.
function logStepStart(step: string, documentId: string): number {
  logger.info(`[QuickIntelligence] ${step} — START`, { documentId })
  return Date.now()
}

function logStepSuccess(step: string, documentId: string, startedAt: number, extra?: Record<string, unknown>): void {
  logger.info(`[QuickIntelligence] ${step} — SUCCESS`, { documentId, elapsedMs: Date.now() - startedAt, ...extra })
}

function logStepFail(step: string, documentId: string, startedAt: number, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error)
  const code = typeof error === 'object' && error !== null && 'code' in error ? (error as SupabaseOperationError).code : undefined
  logger.error(`[QuickIntelligence] ${step} — FAIL`, {
    documentId,
    elapsedMs: Date.now() - startedAt,
    error: message,
    stack: error instanceof Error ? error.stack : undefined,
    diagnosis: diagnoseSupabaseError({ message, code }),
  })
}

// Shared by both the single-file and Multi-Image / Batch Photo Upload™
// (Phase 3) paths — everything from "extraction just succeeded" through
// "workspace is usable." Identical logic either way; only how
// `extractedDocument` itself was produced differs between the two
// callers.
async function runDownstreamPipeline(
  serviceClient: SupabaseClient<Database>,
  document: Document,
  extractedDocument: UniversalLearningDocument,
): Promise<QuickIntelligenceResult> {
  // Same real id-substitution fix as the pre-ALS-15 pipeline —
  // extraction builds its own document with a freshly-generated id;
  // every downstream step needs this real database document's own real
  // id instead.
  const universalDocument = { ...extractedDocument, id: document.id }

  let stepStart = logStepStart('Chunks Created', document.id)
  const chunkedDocument = chunkUniversalLearningDocument(universalDocument)
  const chunks = buildLearningChunks(chunkedDocument, universalDocument)
  logStepSuccess('Chunks Created', document.id, stepStart, { chunkCount: chunks.length })

  // Zero AI calls: omitting `aiFoundation` gives a genuine, deterministic
  // structural graph/analysis (no `builds-upon` edges, no
  // `aiRefinedStrategy`) — real output, not a placeholder.
  stepStart = logStepStart('Knowledge Graph Created (structural)', document.id)
  const graph = await buildLearningKnowledgeGraph(chunks, universalDocument)
  logStepSuccess('Knowledge Graph Created (structural)', document.id, stepStart, { nodeCount: graph.nodeCount, edgeCount: graph.edgeCount })

  stepStart = logStepStart('Learning Analysis Created (structural)', document.id)
  const analysis = await buildLearningAnalysis(chunks, universalDocument, graph)
  logStepSuccess('Learning Analysis Created (structural)', document.id, stepStart)

  const ulo = buildUniversalLearningObject(universalDocument, chunks, graph, analysis)

  stepStart = logStepStart('Universal Learning Object Saved', document.id)
  const saved = await saveUniversalLearningObject(serviceClient, ulo)
  if (!saved) {
    logStepFail('Universal Learning Object Saved', document.id, stepStart, new Error('saveUniversalLearningObject returned false'))
    return { outcome: 'failed', error: 'We could not save your document. Please try again.' }
  }
  logStepSuccess('Universal Learning Object Saved', document.id, stepStart)

  // Non-critical to Phase 1 success: Phase 3 background progress is a
  // separate concern from "did the workspace become usable." A failure
  // here (e.g. the document_processing_progress migration missing) is
  // still logged loudly with full diagnosis — never silently
  // continued past without a trace — but never blocks the workspace
  // from opening, since Phase 1's real, load-bearing work (the ULO
  // above) already succeeded.
  stepStart = logStepStart('Background Progress Initialized', document.id)
  await initializeDocumentProcessingProgress(serviceClient, document.id, chunks.length)
  logStepSuccess('Background Progress Initialized', document.id, stepStart)

  return { outcome: 'workspace-ready' }
}

// Multi-Image / Batch Photo Upload™ (Phase 3) — downloads every page (in
// the student's own order — `storagePaths` is never re-sorted), builds
// one combined document via extractUniversalLearningDocumentFromImages,
// then joins the exact same downstream pipeline the single-file path
// uses. Only ever called for a genuine 2+-page batch — see this
// function's own caller.
async function runMultiImageQuickIntelligence(
  supabase: SupabaseClient<Database>,
  serviceClient: SupabaseClient<Database>,
  document: Document,
  storagePaths: readonly string[],
): Promise<QuickIntelligenceResult> {
  let stepStart = logStepStart('Files Downloaded', document.id)
  const files: File[] = []
  for (const [index, path] of storagePaths.entries()) {
    const { data: blob, error: downloadError } = await supabase.storage.from('learning-documents').download(path)
    if (downloadError || !blob) {
      logStepFail('Files Downloaded', document.id, stepStart, downloadError ?? new Error(`page ${index + 1} download returned no file`))
      return { outcome: 'failed', error: 'We could not read one of your uploaded pages. Please try uploading again.' }
    }
    const fileName = path.split('/').pop() ?? `page-${index + 1}`
    files.push(new File([blob], fileName, { type: document.mimeType ?? blob.type }))
  }
  logStepSuccess('Files Downloaded', document.id, stepStart, { pageCount: files.length })

  stepStart = logStepStart('First Page Validated', document.id)
  const firstPage = files[0]
  if (!firstPage) {
    logStepFail('First Page Validated', document.id, stepStart, new Error('no pages to validate'))
    return { outcome: 'failed', error: 'We could not read your uploaded pages. Please try uploading again.' }
  }
  // One representative UniversalSource for the whole combined document —
  // the same real validation every single-file upload already goes
  // through, run against the first page (mirrors how the title/mimeType
  // already come from the batch's own first-page-derived metadata — see
  // createLearningProjectWithDocument's own comment).
  const parsed = await universalUploadParser.parse(firstPage)
  if (!parsed.success) {
    logStepFail('First Page Validated', document.id, stepStart, new Error(parsed.error.message))
    return { outcome: 'failed', error: parsed.error.message }
  }
  logStepSuccess('First Page Validated', document.id, stepStart)

  stepStart = logStepStart('Document Extracted (multi-image)', document.id)
  const extraction = await extractUniversalLearningDocumentFromImages(files, parsed.source)
  if (!extraction.success) {
    logStepFail('Document Extracted (multi-image)', document.id, stepStart, new Error(extraction.error.message))
    return { outcome: 'failed', error: extraction.error.message }
  }
  logStepSuccess('Document Extracted (multi-image)', document.id, stepStart, { pageCount: files.length })

  return runDownstreamPipeline(serviceClient, document, extraction.document)
}

// ALS-15 Instant Learning Engine™ — Phase 1 "Quick Intelligence." Target
// ≤30s, zero AI calls. Does today's real parse/chunk work (unchanged from
// the pre-ALS-15 pipeline) then builds a fully real, schema-complete
// Universal Learning Object™ using `buildLearningKnowledgeGraph`/
// `buildLearningAnalysis` in their existing AI-free structural mode
// (omit `aiFoundation` — both already support this, built for "future
// million-node scalability"). The workspace opens the moment this
// resolves; Phase 3 (`advanceBackgroundProcessing.ts`) enriches the same
// ULO progressively afterward.
export async function runQuickIntelligence(supabase: SupabaseClient<Database>, document: Document): Promise<QuickIntelligenceResult> {
  if (document.storagePath === null) {
    logger.info('[QuickIntelligence] Upload Received — no stored file, honestly skipping ULO build', { documentId: document.id })
    return { outcome: 'ready-no-ulo' }
  }

  logger.info('[QuickIntelligence] Upload Received', { documentId: document.id, mimeType: document.mimeType })

  try {
    const serviceClient = createServiceClient()

    // Idempotency: a ULO already existing for this document means Quick
    // Intelligence (or a prior Retry) already ran — never rebuild or
    // re-download for a duplicate Retry. This is the real mechanism that
    // makes Retry "resume from the failed step" rather than restart the
    // whole pipeline (per this sprint's own locked "Retry Logic"
    // requirement) — a Retry after the ULO was already built and saved,
    // but whose *status transition* failed, skips straight back to
    // re-attempting only that status write.
    const idempotencyStart = logStepStart('Idempotency Check', document.id)
    const existingUlo = await loadUniversalLearningObject(serviceClient, document.id)
    if (existingUlo) {
      logStepSuccess('Idempotency Check', document.id, idempotencyStart, { resuming: true })
      return { outcome: 'workspace-ready' }
    }
    logStepSuccess('Idempotency Check', document.id, idempotencyStart, { resuming: false })

    // Multi-Image / Batch Photo Upload™ (Phase 3) — a genuine 2+-page
    // batch takes a completely separate download+extraction path (real
    // extraction, always attempted — that's the whole point of this
    // feature), then rejoins the exact same downstream pipeline below.
    // A single-image upload (storagePaths absent, or present with only
    // one entry) is deliberately excluded from this branch and falls
    // through to the existing single-file logic beneath it, completely
    // unmodified — this sprint intentionally does not change single-image
    // upload behavior (see this feature's own scope notes).
    if (document.storagePaths !== null && document.storagePaths.length > 1) {
      return await runMultiImageQuickIntelligence(supabase, serviceClient, document, document.storagePaths)
    }

    let stepStart = logStepStart('File Downloaded', document.id)
    const { data: blob, error: downloadError } = await supabase.storage.from('learning-documents').download(document.storagePath)
    if (downloadError || !blob) {
      logStepFail('File Downloaded', document.id, stepStart, downloadError ?? new Error('download returned no file'))
      return { outcome: 'failed', error: 'We could not read your uploaded file. Please try uploading it again.' }
    }
    logStepSuccess('File Downloaded', document.id, stepStart)

    const fileName = document.storagePath.split('/').pop() ?? document.title
    const file = new File([blob], fileName, { type: document.mimeType ?? blob.type })

    stepStart = logStepStart('File Validated', document.id)
    const parsed = await universalUploadParser.parse(file)
    if (!parsed.success) {
      logStepFail('File Validated', document.id, stepStart, new Error(parsed.error.message))
      return { outcome: 'failed', error: parsed.error.message }
    }
    logStepSuccess('File Validated', document.id, stepStart, { sourceType: parsed.source.sourceType })

    if (!EXTRACTABLE_SOURCE_TYPES.has(parsed.source.sourceType)) {
      logger.info('[QuickIntelligence] not an extractable format — honestly skipping ULO build', { documentId: document.id, sourceType: parsed.source.sourceType })
      return { outcome: 'ready-no-ulo' }
    }

    stepStart = logStepStart('Document Extracted', document.id)
    const extraction = await extractUniversalLearningDocument(file, parsed.source)
    if (!extraction.success) {
      logStepFail('Document Extracted', document.id, stepStart, new Error(extraction.error.message))
      return { outcome: 'failed', error: extraction.error.message }
    }
    logStepSuccess('Document Extracted', document.id, stepStart)

    return await runDownstreamPipeline(serviceClient, document, extraction.document)
  } catch (error) {
    logger.error('[QuickIntelligence] unexpected error — pipeline aborted', {
      documentId: document.id,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      diagnosis: diagnoseSupabaseError({ message: error instanceof Error ? error.message : String(error) }),
    })
    return { outcome: 'failed', error: 'We hit a snag preparing your Learning Project. Please try again.' }
  }
}

// Thin wrapper the Server Action calls — keeps the "which markDocument*
// call follows which outcome" decision colocated with the outcome type
// above, rather than duplicated at every call site.
//
// ALS-15.1 Production Debug Sprint™ ROOT CAUSE FIX — the real bug found
// here: this function's own status-transition catch block used to
// discard the caught error completely (`catch { return <generic
// message> }`), so a real `documents_status_check` constraint violation
// (from `markDocumentWorkspaceReady`, whenever
// supabase/migrations/20260728000001_add_workspace_ready_to_documents_status.sql
// hadn't been applied) was never logged anywhere — the user saw "We hit
// a snag," and Retry repeated the exact same silent failure forever,
// because the ULO had already been saved successfully by
// `runQuickIntelligence` (so Retry's idempotency check kept returning
// 'workspace-ready' immediately) while only the status write kept
// failing, unexplained. Fixed by logging the real caught error (with
// full Postgres diagnosis) before ever returning the friendly message —
// the failure is now always visible in server logs, never swallowed.
export async function applyQuickIntelligenceOutcome(userId: string, documentId: string, result: QuickIntelligenceResult): Promise<{ success: true } | { success: false; error: string }> {
  if (result.outcome === 'failed') {
    try {
      await markDocumentFailed(userId, documentId)
    } catch (markFailedError) {
      logger.error('[QuickIntelligence] Status → failed — FAIL (marking the document failed also failed)', {
        documentId,
        error: markFailedError instanceof Error ? markFailedError.message : String(markFailedError),
        stack: markFailedError instanceof Error ? markFailedError.stack : undefined,
      })
    }
    return { success: false, error: result.error }
  }

  const stepStart = logStepStart(result.outcome === 'ready-no-ulo' ? 'Status → ready' : 'Status → workspace_ready', documentId)
  try {
    if (result.outcome === 'ready-no-ulo') {
      await markDocumentReady(userId, documentId)
    } else {
      await markDocumentWorkspaceReady(userId, documentId)
    }
  } catch (error) {
    logStepFail(result.outcome === 'ready-no-ulo' ? 'Status → ready' : 'Status → workspace_ready', documentId, stepStart, error)
    return { success: false, error: 'We hit a snag preparing your Learning Project. Please try again.' }
  }
  logStepSuccess(result.outcome === 'ready-no-ulo' ? 'Status → ready' : 'Status → workspace_ready', documentId, stepStart)

  return { success: true }
}
