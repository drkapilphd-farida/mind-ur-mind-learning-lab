'use server'

// Reading Intelligence Engine™ Upgrade — Sprint PIPELINE-1: Legacy
// Document Recovery & Background Processing™. Mirrors
// src/lib/exercises/actions/devProgressionTools.ts's own exact
// `requireDevAdmin()` guard (NODE_ENV + ADMIN_EMAILS) — the established,
// real "admin-only manual operation" convention in this codebase.
//
// Deliberately different from every existing dev tool in one real way,
// disclosed rather than silently copied: devProgressionTools.ts's own
// actions only ever touch the calling admin's own account. Legacy
// document recovery is inherently platform-wide — the whole real
// problem is that other users' documents have no progress row — so this
// action operates across every user's documents, not just the caller's.
// That's exactly what the ADMIN_EMAILS allowlist exists to gate; it is
// not a new authorization pattern, only a wider real scope for one that
// already exists.
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { recoverAllLegacyDocuments, type LegacyRecoveryOutcome } from '@/lib/processing/recoverLegacyDocumentProcessing'

async function requireDevAdmin(): Promise<{ userId: string } | { error: string }> {
  if (process.env.NODE_ENV === 'production') {
    return { error: 'Dev tools are not available in production.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not signed in.' }

  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((e) => e.trim()) ?? []
  if (!adminEmails.includes(user.email ?? '')) return { error: 'Admin access required.' }

  return { userId: user.id }
}

export type DevLegacyRecoveryResult = { success: true; outcomes: readonly LegacyRecoveryOutcome[] } | { success: false; error: string }

export async function devRunLegacyRecovery(): Promise<DevLegacyRecoveryResult> {
  const auth = await requireDevAdmin()
  if ('error' in auth) return { success: false, error: auth.error }

  const serviceClient = createServiceClient()
  const outcomes = await recoverAllLegacyDocuments(serviceClient)
  return { success: true, outcomes }
}
