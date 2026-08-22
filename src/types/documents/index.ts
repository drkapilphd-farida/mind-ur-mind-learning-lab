// Domain types for `documents`. Mirrors the `documents` table from
// supabase/migrations/20260711000002_create_learning_projects_and_documents.sql
// — see docs/adr/0001-ai-learning-studio-domain-model.md.
//
// ALS-15 Instant Learning Engine™ — `'workspace_ready'` added by
// supabase/migrations/20260728000001_add_workspace_ready_to_documents_status.sql.
// It means Phase 1 "Quick Intelligence" finished (parse/chunk/structural
// blueprint saved) and the workspace is fully usable; `'ready'` now means
// Phase 3 "Background AI Intelligence" (chunk enrichment, knowledge
// graph, learning analysis) has *also* fully finished — not merely "any
// ULO exists," which is what it meant before this migration.
export type DocumentStatus = 'processing' | 'workspace_ready' | 'ready' | 'failed'

// A document is usable for every Learning Mode — Phase 1 finished,
// regardless of whether Phase 3 background AI work has finished yet.
// Every workspace-gating check in the app should use this instead of a
// raw `status === 'ready'` comparison.
export function isWorkspaceAccessible(status: DocumentStatus): boolean {
  return status === 'workspace_ready' || status === 'ready'
}

export type Document = {
  id: string
  userId: string
  learningProjectId: string | null
  title: string
  storagePath: string | null
  // Multi-Image / Batch Photo Upload™ (Phase 3) — ordered Storage paths
  // for a genuine multi-page photo batch (2+ pages), null for every
  // single-file document (see storagePath for those). See
  // supabase/migrations/20260822000001_add_storage_paths_to_documents.sql.
  storagePaths: readonly string[] | null
  mimeType: string | null
  sizeBytes: number | null
  status: DocumentStatus
  createdAt: string
  updatedAt: string
}
