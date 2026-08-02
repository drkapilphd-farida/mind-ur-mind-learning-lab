'use server'

import { createClient } from '@/lib/supabase/server'
import { createSupabaseSessionPersistenceAdapter } from '@/features/learning-mode-runtime'
import { memoryLearningMode } from '@/core/learning-modes/memory-mode'
import { computeMemoryLearningProfile } from '../intelligence'
import {
  computeMemorySessionAnalytics,
  computeMemoryPerformanceTimeline,
  computeMemoryStrengthDistribution,
  computeMemoryConsistencyMetrics,
  compareMemorySessions,
  computeMemoryImprovementInsights,
  buildAdaptiveSummaryCards,
} from '../analytics'
import type { MemorySessionAnalytics, MemoryTimelinePoint, MemoryStrengthDistribution, MemoryConsistencyMetrics, MemorySessionComparison, AdaptiveSummaryCardData } from '../analytics'
import type { MemoryLearningProfile } from '../intelligence'

export type MemoryAnalyticsDashboard = {
  profile: MemoryLearningProfile
  sessionAnalytics: readonly MemorySessionAnalytics[]
  timeline: readonly MemoryTimelinePoint[]
  strengthDistribution: MemoryStrengthDistribution
  consistency: MemoryConsistencyMetrics
  comparison: MemorySessionComparison | null
  insights: readonly string[]
  summaryCards: readonly AdaptiveSummaryCardData[]
}

export type GetMemoryAnalyticsDashboardResult = { success: true; dashboard: MemoryAnalyticsDashboard } | { success: false; error: string }

// Memory Mode™ Sprint-4 — Memory Analytics & Insights™. The single real
// data source for the Memory Progress Dashboard — one real
// `SessionPersistenceAdapter.listByLearner` call (Sprint-1, unmodified),
// then every Sprint-3/Sprint-4 pure function composed over that one real
// result. No per-widget round trip, no new query shape, no duplicate
// fetch — "zero duplicate architecture" applied to the data-fetching
// boundary itself, not only to the pure logic beneath it.
export async function getMemoryAnalyticsDashboard(): Promise<GetMemoryAnalyticsDashboardResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not signed in.' }

  const persistence = createSupabaseSessionPersistenceAdapter(supabase, user.id, memoryLearningMode.capabilities.sessionType)
  const snapshots = await persistence.listByLearner(user.id)

  const sessionAnalytics = snapshots.map(computeMemorySessionAnalytics)
  const profile = computeMemoryLearningProfile(snapshots)
  const timeline = computeMemoryPerformanceTimeline(sessionAnalytics)
  const strengthDistribution = computeMemoryStrengthDistribution(sessionAnalytics)
  const consistency = computeMemoryConsistencyMetrics(snapshots)

  const mostRecentTwo = [...sessionAnalytics].sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime())
  const comparison = mostRecentTwo.length >= 2 && mostRecentTwo[0] && mostRecentTwo[1] ? compareMemorySessions(mostRecentTwo[0], mostRecentTwo[1]) : null

  const insights = computeMemoryImprovementInsights(profile, consistency, comparison)
  const summaryCards = buildAdaptiveSummaryCards(profile, consistency, strengthDistribution)

  return {
    success: true,
    dashboard: { profile, sessionAnalytics, timeline, strengthDistribution, consistency, comparison, insights, summaryCards },
  }
}
