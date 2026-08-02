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

    const { projectTitle, documentTitle, mimeType, sizeBytes, storagePath } = parsed.data

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

    logger.info('[UploadPipeline] Document Record Created — START', { projectId: project.id, hasStoragePath: storagePath !== undefined })
    const document = await createDocument({
      userId: user.id,
      learningProjectId: project.id,
      title: documentTitle,
      mimeType,
      sizeBytes,
      storagePath: storagePath ?? null,
    })
    logger.info('[UploadPipeline] Document Record Created — SUCCESS', { documentId: document.id, storagePath: document.storagePath })

    return { success: true, projectId: project.id, documentId: document.id }
  } catch (error) {
    logger.error('[UploadPipeline] createLearningProjectWithDocument — FAIL (uncaught exception)', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return { success: false, error: 'We could not start your Learning Project. Please try again.' }
  }
}
