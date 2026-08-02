// Business logic for the `documents` domain. Implemented against
// supabase/migrations/20260711000002_create_learning_projects_and_documents.sql
// — see docs/adr/0002-domain-layered-architecture.md. `api/documents/`
// is the only intended caller. `storage_path` was null through every
// sprint up to AI Learning Studio™ Sprint ALS-10 (Universal Content
// Engine™ Foundation, UCE-1) — no Storage bucket existed yet. It's real
// now (see supabase/migrations/20260719000001_create_learning_documents_bucket.sql).

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { logger } from '@/lib/logger'
import { toSupabaseOperationError } from '@/lib/processing/diagnoseSupabaseError'
import type { Document } from '@/types/documents'

const DOCUMENT_COLUMNS = 'id, user_id, learning_project_id, title, storage_path, mime_type, size_bytes, status, created_at, updated_at' as const

type DocumentRow = {
  id: string
  user_id: string
  learning_project_id: string | null
  title: string
  storage_path: string | null
  mime_type: string | null
  size_bytes: number | null
  status: string
  created_at: string
  updated_at: string
}

function toDocument(row: DocumentRow): Document {
  return {
    id: row.id,
    userId: row.user_id,
    learningProjectId: row.learning_project_id,
    title: row.title,
    storagePath: row.storage_path,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    status: row.status as Document['status'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// AI Learning Studio™ Sprint ALS-3 — the single-document counterpart to
// listDocuments, mirroring services/learning's getLearningProject exactly
// (scoped by both id and user_id, maybeSingle). Needed so the AI
// Processing Experience™'s Upload Verification stage can re-fetch and
// re-validate one specific document by id, without listing every
// document in the project.
export async function getDocument(userId: string, id: string): Promise<Document | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('documents').select(DOCUMENT_COLUMNS).eq('user_id', userId).eq('id', id).maybeSingle()

  if (error) throw new Error(`getDocument failed: ${error.message}`)

  return data ? toDocument(data) : null
}

export async function listDocuments(userId: string, learningProjectId?: string): Promise<readonly Document[]> {
  const supabase = await createClient()
  let query = supabase.from('documents').select(DOCUMENT_COLUMNS).eq('user_id', userId).order('created_at', { ascending: false })
  if (learningProjectId !== undefined) query = query.eq('learning_project_id', learningProjectId)

  const { data, error } = await query
  if (error) throw new Error(`listDocuments failed: ${error.message}`)

  return (data ?? []).map(toDocument)
}

export type CreateDocumentInput = {
  userId: string
  learningProjectId: string | null
  title: string
  mimeType: string
  sizeBytes: number
  // AI Learning Studio™ Sprint ALS-10 (UCE-1) — the real path in the
  // `learning-documents` Storage bucket, when the caller already uploaded
  // the real file there. Optional and nullable: every pre-ALS-10 caller
  // (none exist anymore, but the type stays honest) still works with no
  // storage path at all.
  storagePath?: string | null
}

export async function createDocument(input: CreateDocumentInput): Promise<Document> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('documents')
    .insert({
      user_id: input.userId,
      learning_project_id: input.learningProjectId,
      title: input.title,
      mime_type: input.mimeType,
      size_bytes: input.sizeBytes,
      storage_path: input.storagePath ?? null,
      status: 'processing',
    })
    .select(DOCUMENT_COLUMNS)
    .single()

  if (error) throw new Error(`createDocument failed: ${error.message}`)

  return toDocument(data)
}

// AI Processing Experience™'s finalize step — the one real write in an
// otherwise-mock pipeline (see src/lib/processing/). Scoped by both id
// and user_id, matching this domain's other queries.
export async function markDocumentReady(userId: string, id: string): Promise<Document> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('documents')
    .update({ status: 'ready' })
    .eq('user_id', userId)
    .eq('id', id)
    .select(DOCUMENT_COLUMNS)
    .single()

  if (error) throw toSupabaseOperationError('markDocumentReady failed', error)

  return toDocument(data)
}

// ALS-15 Instant Learning Engine™ — Phase 1 "Quick Intelligence" finished
// (parse/chunk/structural blueprint saved), the workspace is fully
// usable, Phase 3 "Background AI Intelligence" may still be running.
// Mirrors markDocumentReady exactly, one status value earlier.
//
// ALS-15.1 Production Debug Sprint™ — this UPDATE is the exact real
// write that fails with a `documents_status_check` constraint violation
// if supabase/migrations/20260728000001_add_workspace_ready_to_documents_status.sql
// hasn't been applied to this database yet. `toSupabaseOperationError`
// preserves the real Postgres error code on the thrown Error so callers
// can run `diagnoseSupabaseError` on it instead of guessing.
export async function markDocumentWorkspaceReady(userId: string, id: string): Promise<Document> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('documents')
    .update({ status: 'workspace_ready' })
    .eq('user_id', userId)
    .eq('id', id)
    .select(DOCUMENT_COLUMNS)
    .single()

  if (error) throw toSupabaseOperationError('markDocumentWorkspaceReady failed', error)

  return toDocument(data)
}

// AI Learning Studio™ Sprint ALS-10 (UCE-1) — `'failed'` was a real,
// reserved `documents.status` value since Sprint 1 (the CHECK constraint
// has always allowed it, and `[id]/page.tsx` has always had a real
// "This document couldn't be processed" branch for it) but nothing ever
// set it — every document that reached processing was always marked
// `'ready'` unconditionally, since extraction wasn't real yet. Now that
// real extraction can genuinely fail (corrupt file, unsupported legacy
// format), this is the honest counterpart to `markDocumentReady`.
export async function markDocumentFailed(userId: string, id: string): Promise<Document> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('documents')
    .update({ status: 'failed' })
    .eq('user_id', userId)
    .eq('id', id)
    .select(DOCUMENT_COLUMNS)
    .single()

  if (error) throw toSupabaseOperationError('markDocumentFailed failed', error)

  return toDocument(data)
}

// Production AI Cost Optimization — Task 4. Real, clean document
// deletion — backend capability only, no UI trigger this pass (per the
// founder's own explicit scope decision for this mission). Ownership is
// verified first, against the caller's own real, RLS-scoped `getDocument`
// (never trust an id alone) — only once that passes does anything switch
// to the service-role client, for the two real writes RLS can't perform
// today: the Storage bucket has no DELETE policy for `authenticated`
// (see its own migration's comment — "no real delete flow exists yet"),
// and this table's own real `ON DELETE CASCADE` chain (universal_learning_
// objects, generated_learning_content, smart_notes, and this mission's own
// document_chunk_cache/ai_cost_log/document_processing_summary) is exactly
// what makes deleting just the `documents` row enough to clean up
// everything else — no separate delete call needed for any of them. A
// failed Storage delete is logged and does not block the real row
// deletion the caller is waiting on: an orphaned Storage object is a real,
// recoverable cleanup gap, not a reason to leave the document itself
// stuck. Known, disclosed gap this task does not close: deleting a
// Learning Project itself still only `SET NULL`s its documents' own
// `learning_project_id` (see that FK's own migration) rather than
// cascading to them — this function only ever deletes one document at a
// time, by design, per this mission's own scope.
export async function deleteDocument(userId: string, id: string): Promise<{ success: true } | { success: false; error: string }> {
  const document = await getDocument(userId, id)
  if (!document) {
    return { success: false, error: 'This document could not be found.' }
  }

  const serviceClient = createServiceClient()

  if (document.storagePath !== null) {
    const { error: storageError } = await serviceClient.storage.from('learning-documents').remove([document.storagePath])
    if (storageError) {
      logger.error('failed to delete stored document file during document deletion', { error: storageError.message, documentId: id })
    }
  }

  const { error } = await serviceClient.from('documents').delete().eq('id', id).eq('user_id', userId)
  if (error) {
    logger.error('failed to delete document row', { error: error.message, documentId: id })
    return { success: false, error: 'We could not delete this document. Please try again.' }
  }

  return { success: true }
}

// Upload Experience™'s Duplicate Detection — a real check against the
// user's own existing documents (title match), not a placeholder. A
// false positive across two different users is impossible (scoped by
// user_id, matching documents' own RLS posture).
export async function hasDocumentWithTitle(userId: string, title: string): Promise<boolean> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from('documents')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('title', title)

  if (error) throw new Error(`hasDocumentWithTitle failed: ${error.message}`)

  return (count ?? 0) > 0
}
