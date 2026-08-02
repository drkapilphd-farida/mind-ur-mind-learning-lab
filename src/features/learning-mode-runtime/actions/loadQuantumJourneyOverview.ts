'use server'

import { z } from 'zod'
import { loadLearningAssetBundles } from '@/features/learning-mode-runtime/persistence/learningAssetBundles'
import { loadChapterIntelligenceBlueprints } from '@/features/learning-mode-runtime/persistence/chapterIntelligenceBlueprints'
import { computeDailyStreak } from '@/lib/exercises/practiceHistory'
import type { PracticeSessionRecord } from '@/lib/exercises/queries/getPracticeSessions'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { logger } from '@/lib/logger'
import { deriveQuantumJourneyChapters, type DeriveChapterInput, type QuantumJourneyChapterCard } from './internal/deriveQuantumJourneyChapters'

const LoadQuantumJourneyOverviewInputSchema = z.object({ documentId: z.string().uuid() })

export type QuantumJourneyOverviewResult =
  | {
      success: true
      documentId: string
      documentTitle: string
      chapters: readonly QuantumJourneyChapterCard[]
      currentChapterOrder: number
      totalChapters: number
      chaptersCompleted: number
      overallProgressPercent: number
      totalReadingMinutes: number
      currentStreak: number
      journeyCompleted: boolean
    }
  // `reason` lets the caller show a calm "still preparing" empty state
  // (Objective 10) instead of an alarming error frame (Objective 11) for
  // the one case that isn't really a failure — processing genuinely still
  // in progress. Optional and defaults to an unexpected-error reading in
  // the UI, so no existing caller needs to change.
  | { success: false; error: string; reason?: 'not-processed' | 'not-found' }

type QuantumJourneySessionRow = {
  data: { documentId?: unknown; chapterOrder?: unknown; assessmentScore?: unknown }
  status: string
  started_at: string
  completed_at: string | null
}

function isRowShaped(row: unknown): row is QuantumJourneySessionRow {
  if (typeof row !== 'object' || row === null) return false
  const candidate = row as Record<string, unknown>
  return typeof candidate.data === 'object' && candidate.data !== null && typeof candidate.status === 'string' && typeof candidate.started_at === 'string'
}

// Reading Intelligence Engine™ Upgrade — Sprint QSR-2.5: Reading Journey
// UX & Navigation™. A pure read, no new state: every figure here is
// derived from tables Sprint QSR-2 already writes to
// (chapter_intelligence_blueprints, learning_asset_bundles,
// learning_sessions) plus real, already-existing per-chapter Blueprint
// metadata (header.title, estimatedReadingTime/estimatedLearningTime) —
// nothing new is persisted. Chapter status is a real, sequential
// derivation, mirroring getModuleProgress's own deriveAvailability
// precedent: at most one chapter is ever 'current' (the first
// non-completed, unlocked one) or 'ready' (same chapter, never started
// yet); everything after it is 'locked'; everything at or before the
// last completed chapter is 'completed'.
export async function loadQuantumJourneyOverview(input: unknown): Promise<QuantumJourneyOverviewResult> {
  const parsed = LoadQuantumJourneyOverviewInputSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid reading journey overview request.' }
  const { documentId } = parsed.data

  // Real safety net (previously missing): this whole function's only job is
  // to feed a passive dashboard screen, and every await below it (auth,
  // two Supabase queries, the service-role client, two persistence loads)
  // was previously unguarded — any transient failure in any one of them
  // (a dropped connection, a cold-start race, an edge-case session state)
  // would propagate as an uncaught exception straight past every
  // `success:false` branch below and hit the nearest error boundary
  // directly, which is exactly the wrong outcome for a dashboard the
  // brief explicitly wants to "keep learner confidence" (never a raw
  // crash). Every real path this function can take now returns an honest
  // QuantumJourneyOverviewResult; the one genuinely unexpected case is
  // logged with its real message/stack so it's traceable, and degrades to
  // the same warm error frame the UI already renders for other honest
  // failures — never the generic Next.js error boundary.
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not signed in.' }

    const { data: document, error: documentError } = await supabase.from('documents').select('id, title').eq('id', documentId).eq('user_id', user.id).maybeSingle()
    if (documentError || !document) return { success: false, error: 'This document could not be found.', reason: 'not-found' }

    const serviceClient = createServiceClient()
    const bundles = await loadLearningAssetBundles(serviceClient, documentId)
    if (bundles.size === 0) return { success: false, error: 'This document has no real Learning Assets yet — processing may still be in progress.', reason: 'not-processed' }

    const blueprints = await loadChapterIntelligenceBlueprints(serviceClient, documentId)
    const totalChapters = bundles.size

    const { data: allSessions, error: sessionsError } = await supabase.from('learning_sessions').select('data, status, started_at, completed_at').eq('user_id', user.id).eq('session_type', 'qsr-journey')

    if (sessionsError) {
      logger.error('failed to load quantum journey sessions for overview', { error: sessionsError.message, userId: user.id, documentId })
      return { success: false, error: 'We could not load your journey progress. Please try again.' }
    }

    const rows = ((allSessions ?? []) as unknown[]).filter(isRowShaped)
    const documentRows = rows.filter((row) => row.data.documentId === documentId)
    const rowsByChapter = new Map<number, QuantumJourneySessionRow>()
    for (const row of documentRows) {
      if (typeof row.data.chapterOrder === 'number') rowsByChapter.set(row.data.chapterOrder, row)
    }

    const chapterInputs: DeriveChapterInput[] = []
    for (let chapterOrder = 0; chapterOrder < totalChapters; chapterOrder += 1) {
      const blueprint = blueprints.get(chapterOrder)?.blueprint
      const row = rowsByChapter.get(chapterOrder)
      const assessmentScoreRaw = row?.data.assessmentScore
      const assessmentScore =
        assessmentScoreRaw !== null && typeof assessmentScoreRaw === 'object' && assessmentScoreRaw !== undefined && 'correct' in assessmentScoreRaw && 'total' in assessmentScoreRaw
          ? (assessmentScoreRaw as { correct: number; total: number })
          : null

      chapterInputs.push({
        chapterOrder,
        title: blueprint?.header.title ?? null,
        estimatedMinutes: blueprint ? Math.max(1, Math.round((blueprint.header.estimatedReadingTime + blueprint.header.estimatedLearningTime) / 60)) : null,
        isCompleted: row?.status === 'completed',
        isStarted: row !== undefined,
        assessmentScore,
      })
    }
    const { chapters, currentChapterOrder, chaptersCompleted } = deriveQuantumJourneyChapters(chapterInputs)

    const totalReadingMinutes = Math.round(
      documentRows.reduce((total, row) => {
        if (row.completed_at === null) return total
        const startedMs = new Date(row.started_at).getTime()
        const completedMs = new Date(row.completed_at).getTime()
        return total + Math.max(0, completedMs - startedMs)
      }, 0) / 60000,
    )

    const streakInput: PracticeSessionRecord[] = rows.map((row) => ({
      exerciseId: 'qsr-journey',
      durationMs: 0,
      completed: row.status === 'completed',
      occurredAt: row.completed_at ?? row.started_at,
    }))
    const { currentStreak } = computeDailyStreak(streakInput)

    return {
      success: true,
      documentId,
      documentTitle: document.title,
      chapters,
      currentChapterOrder,
      totalChapters,
      chaptersCompleted,
      overallProgressPercent: Math.round((chaptersCompleted / totalChapters) * 100),
      totalReadingMinutes,
      currentStreak,
      journeyCompleted: chaptersCompleted === totalChapters,
    }
  } catch (error) {
    logger.error('unexpected exception in loadQuantumJourneyOverview', { error: error instanceof Error ? error.message : String(error), stack: error instanceof Error ? error.stack : undefined, documentId })
    return { success: false, error: 'We could not load your reading journey. Please try again.' }
  }
}
