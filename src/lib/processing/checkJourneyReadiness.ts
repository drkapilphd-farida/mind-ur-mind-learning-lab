import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { loadLearningAssetBundles } from '@/features/learning-mode-runtime/persistence/learningAssetBundles'
import { loadChapterIntelligenceBlueprints } from '@/features/learning-mode-runtime/persistence/chapterIntelligenceBlueprints'

export type JourneyReadinessResult = {
  ready: boolean
  totalChapters: number
  blueprintsComplete: boolean
  learningAssetsComplete: boolean
}

// Reading Intelligence Engine™ Upgrade — Sprint PIPELINE-1: Legacy
// Document Recovery & Background Processing™. Objective 6 — one reusable
// "is this document's Reading Journey actually startable" check, built
// from the same real persistence functions the Reading Journey's own
// code already calls (loadLearningAssetBundles/
// loadChapterIntelligenceBlueprints) — but this sprint does not modify
// the Reading Journey itself (locked): this function is new,
// stand-alone infrastructure, used this sprint only by the new
// processing-dashboard/recovery code. Wiring the Journey's own action
// files to call this instead of their inline equivalent check is
// deliberately left for a future, separately-scoped sprint.
//
// "Ready" is defined the same way advanceBackgroundProcessing's own
// final stage already defines it: a real Learning Asset Bundle for
// every real chapter — the same real chapter count each chapter's own
// Blueprint independently agrees on. `totalChapters` here is read from
// the real Blueprint count (not `document_processing_progress.
// total_chapters`), since this function is meant to answer "is the real
// output actually there," never "does the progress row merely say so."
export async function checkJourneyReadiness(supabase: SupabaseClient<Database>, documentId: string): Promise<JourneyReadinessResult> {
  const [blueprints, bundles] = await Promise.all([loadChapterIntelligenceBlueprints(supabase, documentId), loadLearningAssetBundles(supabase, documentId)])

  const totalChapters = blueprints.size
  const blueprintsComplete = totalChapters > 0
  const learningAssetsComplete = totalChapters > 0 && bundles.size >= totalChapters

  return {
    ready: blueprintsComplete && learningAssetsComplete,
    totalChapters,
    blueprintsComplete,
    learningAssetsComplete,
  }
}
