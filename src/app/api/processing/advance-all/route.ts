import { type NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { advanceBackgroundProcessing } from '@/lib/processing/advanceBackgroundProcessing'
import { recoverAllLegacyDocuments } from '@/lib/processing/recoverLegacyDocumentProcessing'
import { runQuickIntelligence, applyQuickIntelligenceOutcome } from '@/lib/processing/runQuickIntelligence'
import { logger } from '@/lib/logger'
import type { Document } from '@/types/documents'

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

function isAuthorized(request: NextRequest): { authorized: true } | { authorized: false; status: number; error: string } {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return { authorized: false, status: 500, error: 'CRON_SECRET is not configured.' }

  // Vercel Cron's own real, documented convention: a scheduled GET
  // request carries `Authorization: Bearer <CRON_SECRET>` automatically
  // once CRON_SECRET is set on the deployment — checked first so a real
  // `vercel.json` cron entry works with zero extra configuration.
  // `x-cron-secret` is accepted too, only so this route can be exercised
  // directly (curl, this sprint's own production demonstration) without
  // needing to hand-construct a Bearer header.
  const authHeader = request.headers.get('authorization')
  const bearerSecret = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null
  const providedSecret = bearerSecret ?? request.headers.get('x-cron-secret')

  if (!providedSecret) return { authorized: false, status: 400, error: 'Missing Authorization (Bearer) or x-cron-secret header.' }
  if (providedSecret !== cronSecret) return { authorized: false, status: 401, error: 'Invalid secret.' }

  return { authorized: true }
}

// Reading Intelligence Engine™ Upgrade — Sprint PIPELINE-1: Legacy
// Document Recovery & Background Processing™. Objective 2 — the one
// piece of this sprint that can genuinely resume processing with zero
// browser open: a cron-callable, service-role, cross-user batch advance.
// Recovers any newly-legacy document first, then advances every
// `workspace_ready` document by one real step each, reusing the exact
// same, unmodified advanceBackgroundProcessing every other trigger
// already calls — no new locking needed, the existing per-document lock
// already makes concurrent callers safe.
//
// Disclosed, not glossed over: this route is real and independently
// testable right now (a direct request with the correct header genuinely
// advances real documents — see this sprint's production demonstration).
// Whether it actually fires on a schedule depends on this app being
// deployed with `CRON_SECRET` set and `vercel.json`'s `crons` entry
// active — outside what a local dev session can verify.
//
// Sprint PIPELINE-2 — Upload Reliability & Processing Fix™. Also
// recovers documents stuck at status:'processing' (Phase 1 never
// finished — see pollAllInFlightProcessing.ts's own comment for the real
// root cause: Phase 1 was only ever triggered by one specific screen's
// own useEffect, with no retry anywhere else). Real, service-role
// equivalent of what that user-scoped poller does, for true
// browser-independent resumability.
async function runBatchAdvance(): Promise<{ recoveredCount: number; phase1RecoveredCount: number; inFlightCount: number; advancedCount: number } | { error: string }> {
  const supabase = createServiceClient()

  const recoveryOutcomes = await recoverAllLegacyDocuments(supabase)
  const recoveredCount = recoveryOutcomes.filter((outcome) => outcome.outcome === 'recovered').length

  const { data: stuckPhase1Rows, error: phase1Error } = await supabase
    .from('documents')
    .select('id, user_id, learning_project_id, title, storage_path, mime_type, size_bytes, status, created_at, updated_at')
    .eq('status', 'processing')

  if (phase1Error) {
    logger.error('[advance-all] failed to list Phase-1-stuck documents', { error: phase1Error.message })
    return { error: 'Failed to list Phase-1-stuck documents.' }
  }

  let phase1RecoveredCount = 0
  for (const row of stuckPhase1Rows ?? []) {
    const document = toDocument(row as DocumentRow)
    const result = await runQuickIntelligence(supabase, document)
    const applied = await applyQuickIntelligenceOutcome(document.userId, document.id, result)
    if (applied.success && result.outcome !== 'failed') phase1RecoveredCount += 1
  }

  const { data: inFlightRows, error } = await supabase
    .from('documents')
    .select('id, user_id, learning_project_id, title, storage_path, mime_type, size_bytes, status, created_at, updated_at')
    .eq('status', 'workspace_ready')

  if (error) {
    logger.error('[advance-all] failed to list in-flight documents', { error: error.message })
    return { error: 'Failed to list in-flight documents.' }
  }

  let advancedCount = 0
  for (const row of inFlightRows ?? []) {
    const result = await advanceBackgroundProcessing(toDocument(row as DocumentRow))
    if (result.outcome === 'advanced' || result.outcome === 'complete') advancedCount += 1
  }

  logger.info('[advance-all] batch run complete', { recoveredCount, phase1RecoveredCount, inFlightCount: inFlightRows?.length ?? 0, advancedCount })
  return { recoveredCount, phase1RecoveredCount, inFlightCount: inFlightRows?.length ?? 0, advancedCount }
}

// GET — the real entry point Vercel Cron invokes.
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = isAuthorized(request)
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const result = await runBatchAdvance()
  if ('error' in result) return NextResponse.json(result, { status: 500 })
  return NextResponse.json(result)
}

// POST — same secret check, same batch logic; kept for manual/direct
// invocation (this sprint's own real production demonstration uses this).
export async function POST(request: NextRequest): Promise<NextResponse> {
  return GET(request)
}
