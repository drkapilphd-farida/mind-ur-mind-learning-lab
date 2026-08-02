'use server'

import { createClient } from '@/lib/supabase/server'
import { createSupabaseSessionPersistenceAdapter } from '@/features/learning-mode-runtime'
import { smartNotesMode } from '@/core/learning-modes/smart-notes'
import { computeSmartNotesLearningProfile } from '../intelligence'
import { countSmartNotesWithContent } from '../notes/countSmartNotesWithContent'
import {
  computeSmartNotesSessionAnalytics,
  computeSmartNotesPerformanceTimeline,
  computeSmartNotesEngagementDistribution,
  computeSmartNotesConsistencyMetrics,
  compareSmartNotesSessions,
  computeSmartNotesImprovementInsights,
  buildSmartNotesSummaryCards,
} from '../analytics'
import type { SmartNotesSessionAnalytics, SmartNotesTimelinePoint, SmartNotesEngagementDistribution, SmartNotesConsistencyMetrics, SmartNotesSessionComparison, SmartNotesSummaryCardData } from '../analytics'
import type { SmartNotesLearningProfile } from '../intelligence'

export type SmartNotesAnalyticsDashboard = {
  profile: SmartNotesLearningProfile
  sessionAnalytics: readonly SmartNotesSessionAnalytics[]
  timeline: readonly SmartNotesTimelinePoint[]
  engagementDistribution: SmartNotesEngagementDistribution
  consistency: SmartNotesConsistencyMetrics
  comparison: SmartNotesSessionComparison | null
  insights: readonly string[]
  summaryCards: readonly SmartNotesSummaryCardData[]
}

export type GetSmartNotesAnalyticsDashboardResult = { success: true; dashboard: SmartNotesAnalyticsDashboard } | { success: false; error: string }

// Smart Notes™ Sprint-4 — Analytics & Insights™. The single real data
// source for the Smart Notes Progress Dashboard — one real
// `SessionPersistenceAdapter.listByLearner` call plus one real
// `count`-only notes query (Sprint-1/Sprint-3, unmodified), then every
// pure function composed over those two real results. No per-widget
// round trip, no new query shape. Mirrors Memory Mode™'s own
// `getMemoryAnalyticsDashboard` (Sprint-4) exactly.
export async function getSmartNotesAnalyticsDashboard(): Promise<GetSmartNotesAnalyticsDashboardResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not signed in.' }

  const persistence = createSupabaseSessionPersistenceAdapter(supabase, user.id, smartNotesMode.capabilities.sessionType)
  const [snapshots, documentsWithNotes] = await Promise.all([persistence.listByLearner(user.id), countSmartNotesWithContent(supabase, user.id)])

  const sessionAnalytics = snapshots.map(computeSmartNotesSessionAnalytics)
  const profile = computeSmartNotesLearningProfile(snapshots, documentsWithNotes)
  const timeline = computeSmartNotesPerformanceTimeline(sessionAnalytics)
  const engagementDistribution = computeSmartNotesEngagementDistribution(sessionAnalytics)
  const consistency = computeSmartNotesConsistencyMetrics(snapshots)

  const mostRecentTwo = [...sessionAnalytics].sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime())
  const comparison = mostRecentTwo.length >= 2 && mostRecentTwo[0] && mostRecentTwo[1] ? compareSmartNotesSessions(mostRecentTwo[0], mostRecentTwo[1]) : null

  const insights = computeSmartNotesImprovementInsights(profile, consistency, comparison)
  const summaryCards = buildSmartNotesSummaryCards(profile, consistency, engagementDistribution)

  return {
    success: true,
    dashboard: { profile, sessionAnalytics, timeline, engagementDistribution, consistency, comparison, insights, summaryCards },
  }
}
