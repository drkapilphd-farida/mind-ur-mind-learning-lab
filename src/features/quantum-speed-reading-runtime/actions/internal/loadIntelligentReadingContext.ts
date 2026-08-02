import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type { LearningAssetBundle } from '@/core/universal-learning-engine/learning-assets'
import { loadLearningAssetBundles } from '@/features/learning-mode-runtime/persistence/learningAssetBundles'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { loadReadingExperienceProgress, type ReadingExperienceProgressRecord } from '../../persistence/readingExperienceSessionRecord'

export type IntelligentReadingContext = {
  // The real, user-scoped (RLS-respecting) client — used for this
  // learner's own `learning_sessions` progress row, exactly like every
  // other real session-lifecycle action in this codebase.
  supabase: SupabaseClient<Database>
  userId: string
  bundle: LearningAssetBundle
  totalChapters: number
  existing: { sessionId: string; record: ReadingExperienceProgressRecord } | null
}

export type IntelligentReadingContextResult = { success: true; context: IntelligentReadingContext } | { success: false; error: string }

// Reading Intelligence Engine™ Upgrade — Sprint-4. Shared real setup
// every "Intelligent Reading" Server Action needs: authenticate, load
// the real, already-generated `LearningAssetBundle` for this chapter
// (never regenerated, never re-derived from raw chunks — Sprint-2's own
// stored output, read verbatim), and load this learner's own real,
// previously-persisted progress marker, if any.
//
// `chapter_intelligence_blueprints`/`learning_asset_bundles` are
// deliberately service-role-only tables (no authenticated RLS policy at
// all — both migrations' own explicit design) — the user-scoped client
// can never read them directly, by design. This function performs one
// real, explicit ownership check (`documents.user_id = auth.uid()`, via
// the user-scoped client, which RLS itself already enforces) BEFORE
// using the service-role client to load the Bundle — never trusting
// `documentId` alone, so one learner can never read another's Learning
// Assets by guessing an id.
export async function loadIntelligentReadingContext(documentId: string, chapterOrder: number): Promise<IntelligentReadingContextResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not signed in.' }

  const { data: document, error: documentError } = await supabase.from('documents').select('id').eq('id', documentId).eq('user_id', user.id).maybeSingle()
  if (documentError || !document) return { success: false, error: 'This document could not be found.' }

  const serviceClient = createServiceClient()
  const bundles = await loadLearningAssetBundles(serviceClient, documentId)
  if (bundles.size === 0) return { success: false, error: 'This document has no real Learning Assets yet — processing may still be in progress.' }

  const bundleEntry = bundles.get(chapterOrder)
  if (!bundleEntry) return { success: false, error: 'This chapter does not exist for this document.' }

  const existing = await loadReadingExperienceProgress(supabase, user.id, documentId, chapterOrder)

  return { success: true, context: { supabase, userId: user.id, bundle: bundleEntry.bundle, totalChapters: bundles.size, existing } }
}
