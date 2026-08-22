'use server'

// Server Actions for New Learning Project™ (Sprint 1, Chunk 2). Thin
// orchestration only — all real logic lives in api/learning and
// api/documents, per docs/adr/0002-domain-layered-architecture.md.
// `documentTitle`/`mimeType`/`sizeBytes` are metadata already validated
// client-side by validateDocumentFile(); this action re-validates at
// the boundary (never trusts the client) before writing anything.

import { z } from 'zod'
import { createDocument, hasDocumentWithTitle } from '@/api/documents'
import { createLearningProject } from '@/api/learning'
import { ACCEPTED_DOCUMENT_MIME_TYPES, MAX_DOCUMENT_SIZE_BYTES } from '@/constants/documents'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

const CreateLearningProjectWithDocumentSchema = z.object({
  projectTitle: z.string().trim().max(200).optional(),
  documentTitle: z.string().trim().min(1, 'Document title is required').max(200),
  mimeType: z.enum(ACCEPTED_DOCUMENT_MIME_TYPES),
  sizeBytes: z.number().int().positive().max(MAX_DOCUMENT_SIZE_BYTES),
  // AI Learning Studio™ Sprint ALS-10 (UCE-1) — the real path the client
  // already uploaded the real file to in the `learning-documents` Storage
  // bucket, before calling this action. Optional: a caller whose real
  // Storage upload failed can still create the project/document row
  // (metadata-only, exactly like every sprint before this one), rather
  // than losing the whole submission over a storage-specific failure.
  storagePath: z.string().trim().min(1).max(500).optional(),
  // Multi-Image / Batch Photo Upload™ (Phase 3) — the ordered Storage
  // paths for a genuine multi-page photo batch (student-defined page
  // order, preserved exactly as the array arrives — never re-sorted
  // here). Optional, same "upload failure still creates a metadata-only
  // row" reasoning as storagePath above; a caller that only ever sends
  // a single image keeps using storagePath alone, this stays absent.
  storagePaths: z.array(z.string().trim().min(1).max(500)).min(2).max(50).optional(),
})

export type CreateLearningProjectWithDocumentInput = z.infer<typeof CreateLearningProjectWithDocumentSchema>

export type CreateLearningProjectWithDocumentResult =
  | { success: true; projectId: string; documentId: string }
  | { success: false; error: string }

// ALS-15.2 Universal Upload Pipeline Recovery™ — wrapped in a real
// try/catch: before this, an unexpected exception from
// `createLearningProject`/`createDocument` (both throw a real Error on
// any Supabase failure — an RLS rejection, a constraint violation, a
// connectivity error) would propagate uncaught out of this Server
// Action, surfacing as Next.js's own generic error page instead of this
// app's friendly upload-error state — and with nothing logged in this
// app's own structured server log to explain why.
export async function createLearningProjectWithDocument(
  input: CreateLearningProjectWithDocumentInput,
): Promise<CreateLearningProjectWithDocumentResult> {
  const parsed = CreateLearningProjectWithDocumentSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Please check your project details.' }
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'You must be signed in to start a Learning Project.' }
    }

    const { projectTitle, documentTitle, mimeType, sizeBytes, storagePath, storagePaths } = parsed.data

    // Never trust a client-supplied path outright — the Storage bucket's own
    // RLS already scopes reads/writes to `{user_id}/...`, but rejecting a
    // path that doesn't even claim to be this user's here too is a real,
    // cheap defense-in-depth check, matching this action's own existing
    // discipline of re-validating mimeType/sizeBytes rather than trusting
    // what the client already checked.
    if (storagePath !== undefined && !storagePath.startsWith(`${user.id}/`)) {
      logger.error('[UploadPipeline] Document Record Created — FAIL', { reason: 'storagePath does not belong to the authenticated user', storagePath })
      return { success: false, error: 'This upload could not be verified. Please try again.' }
    }

    // Same defense-in-depth check, applied to every page in the batch —
    // one page failing this check is treated the same as the single-path
    // case: reject the whole submission rather than silently dropping
    // just that page (a chapter missing one page in the middle would be
    // a much worse, quieter failure than an honest upfront error).
    if (storagePaths !== undefined && storagePaths.some((path) => !path.startsWith(`${user.id}/`))) {
      logger.error('[UploadPipeline] Document Record Created — FAIL', { reason: 'a storagePaths entry does not belong to the authenticated user' })
      return { success: false, error: 'This upload could not be verified. Please try again.' }
    }

    const isDuplicate = await hasDocumentWithTitle(user.id, documentTitle)
    if (isDuplicate) {
      return { success: false, error: 'You already have a document with this title.' }
    }

    logger.info('[UploadPipeline] Learning Project Created — START', { userId: user.id })
    const project = await createLearningProject({
      userId: user.id,
      title: projectTitle && projectTitle.length > 0 ? projectTitle : documentTitle,
    })
    logger.info('[UploadPipeline] Learning Project Created — SUCCESS', { projectId: project.id })

    // Multi-Image / Batch Photo Upload™ (Phase 3) — `storagePath`
    // (singular) still gets a real value for a multi-image batch too:
    // the first page's path. Every pre-existing reader of `storagePath`
    // alone (deleteDocument's own Storage cleanup, any display code that
    // only knows the singular field) still gets something real and
    // honest — "the first page" — rather than null, while the full
    // ordered set lives in `storagePaths` for anything that needs every
    // page.
    const resolvedStoragePath = storagePath ?? storagePaths?.[0] ?? null
    logger.info('[UploadPipeline] Document Record Created — START', {
      projectId: project.id,
      hasStoragePath: resolvedStoragePath !== null,
      pageCount: storagePaths?.length ?? (storagePath !== undefined ? 1 : 0),
    })
    const document = await createDocument({
      userId: user.id,
      learningProjectId: project.id,
      title: documentTitle,
      mimeType,
      sizeBytes,
      storagePath: resolvedStoragePath,
      storagePaths: storagePaths ?? null,
    })
    logger.info('[UploadPipeline] Document Record Created — SUCCESS', { documentId: document.id, storagePath: document.storagePath, pageCount: document.storagePaths?.length ?? null })

    return { success: true, projectId: project.id, documentId: document.id }
  } catch (error) {
    logger.error('[UploadPipeline] createLearningProjectWithDocument — FAIL (uncaught exception)', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return { success: false, error: 'We could not start your Learning Project. Please try again.' }
  }
}
