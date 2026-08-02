// ALS-15.1 Production Debug Sprint™ — root-cause detection. Every real
// Postgres/PostgREST error this pipeline can hit is either a genuine
// runtime failure or a symptom of a migration that was written
// (supabase/migrations/) but never actually applied to the real
// database. This maps the exact, real error text/code Postgres returns
// back to the exact migration file that would fix it — automatic
// detection, never a silent continue, per this sprint's own locked
// brief ("If migrations are missing, detect it automatically, and
// report the exact migration name").

export type SupabaseErrorLike = { message: string; code?: string | undefined }

type KnownMigrationIssue = {
  matches: (error: SupabaseErrorLike) => boolean
  migration: string
  explanation: string
}

// Real Postgres error shapes this pipeline can actually hit:
// - 23514 (check_violation) on `documents_status_check` — the
//   `'workspace_ready'` status value doesn't exist yet in the database's
//   own CHECK constraint.
// - 42P01 (undefined_table) on `document_processing_progress` — the
//   table itself was never created.
const KNOWN_MIGRATION_ISSUES: readonly KnownMigrationIssue[] = [
  {
    matches: (error) => /documents_status_check/i.test(error.message),
    migration: 'supabase/migrations/20260728000001_add_workspace_ready_to_documents_status.sql',
    explanation: "documents.status does not yet accept 'workspace_ready' — this migration widening its CHECK constraint has not been applied to this database.",
  },
  {
    matches: (error) => /document_processing_progress/i.test(error.message) && (error.code === '42P01' || /does not exist|could not find/i.test(error.message)),
    migration: 'supabase/migrations/20260728000002_create_document_processing_progress.sql',
    explanation: 'The document_processing_progress table does not exist — this migration has not been applied to this database.',
  },
]

// Never swallows anything: always returns a real, complete diagnostic
// string — either a matched, named migration fix, or (when no known
// pattern matches) the raw Postgres code + message verbatim, so the real
// failure is always visible in server logs, never hidden behind a
// generic label.
export function diagnoseSupabaseError(error: SupabaseErrorLike): string {
  const match = KNOWN_MIGRATION_ISSUES.find((issue) => issue.matches(error))
  if (match) {
    return `MIGRATION MISSING: ${match.migration} — ${match.explanation} (Postgres said: [${error.code ?? 'no-code'}] ${error.message})`
  }
  return `[${error.code ?? 'no-code'}] ${error.message}`
}

export type SupabaseOperationError = Error & { code?: string }

// Builds a real Error that carries the Postgres error `code` through as
// a real property (not just folded into the message string), so a
// caller further up the stack can call `diagnoseSupabaseError` on it
// without needing to parse the message back apart. Used by every
// services/documents write that can hit the two known migration-gap
// failure modes above.
export function toSupabaseOperationError(prefix: string, error: SupabaseErrorLike): SupabaseOperationError {
  const thrown = new Error(`${prefix}: ${error.message}`) as SupabaseOperationError
  if (error.code !== undefined) thrown.code = error.code
  return thrown
}
