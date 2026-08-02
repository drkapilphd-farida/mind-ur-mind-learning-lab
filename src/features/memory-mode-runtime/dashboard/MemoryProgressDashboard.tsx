import { Brain } from 'lucide-react'
import { EmptyStateCard } from '@/components/ui/empty-state-card'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import { getMemoryAnalyticsDashboard } from '../actions/getMemoryAnalyticsDashboard'
import { AdaptiveSummaryCards } from './AdaptiveSummaryCards'
import { MemoryPerformanceTimeline } from './MemoryPerformanceTimeline'
import { MemoryStrengthIndicators } from './MemoryStrengthIndicators'
import { MemorySessionAnalyticsList } from './MemorySessionAnalyticsList'
import { SessionComparisonCard } from './SessionComparisonCard'
import { MemoryImprovementInsightsCard } from './MemoryImprovementInsightsCard'

// Memory Mode™ Sprint-4 — Memory Analytics & Insights™. Memory Progress
// Dashboard (item 2) — the real top-level orchestrator, an async Server
// Component fetching once from `getMemoryAnalyticsDashboard` (one real
// `listByLearner` call underneath) and composing every other widget this
// sprint built from that single result. No client boundary anywhere in
// this tree — the whole dashboard is read-only, so there is nothing to
// make interactive, and nothing here can accidentally pull server-only
// code into a client bundle the way Sprint-2 briefly did.
//
// Memory Mode™ Sprint-5 polish: a soft page-level fade-in plus a slightly
// earlier header entrance, small horizontal breathing room on mobile
// (`px-1 sm:px-0`), and matching fade-ins on both real empty states. No
// section, no data shape, no fetch call changed.
export async function MemoryProgressDashboard(): Promise<React.JSX.Element> {
  const result = await getMemoryAnalyticsDashboard()

  if (!result.success) {
    return (
      <div className="animate-in fade-in mx-auto max-w-lg px-6 py-16 duration-(--duration-slow)">
        <EmptyStateCard icon={Brain} title="Sign in to see your memory analytics" description={result.error} />
      </div>
    )
  }

  const { dashboard } = result

  if (dashboard.profile.sessionsCompleted === 0 && dashboard.sessionAnalytics.length === 0) {
    return (
      <div className="animate-in fade-in mx-auto max-w-lg px-6 py-16 duration-(--duration-slow)">
        <EmptyStateCard icon={Brain} title="No memory sessions yet" description="Complete your first Memory session to start seeing real analytics and insights here." />
      </div>
    )
  }

  return (
    <div className="space-y-8 px-1 pb-4 sm:px-0">
      <div className="animate-in fade-in slide-in-from-top-1 duration-(--duration-base)">
        <p className={TYPOGRAPHY.label}>Memory Mode™</p>
        <h1 className={cn(TYPOGRAPHY.h1, 'mt-1')}>Your Memory Progress</h1>
      </div>

      <AdaptiveSummaryCards cards={dashboard.summaryCards} />

      <MemoryPerformanceTimeline timeline={dashboard.timeline} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MemoryStrengthIndicators distribution={dashboard.strengthDistribution} />
        <SessionComparisonCard comparison={dashboard.comparison} />
      </div>

      <MemoryImprovementInsightsCard insights={dashboard.insights} />

      <MemorySessionAnalyticsList sessionAnalytics={dashboard.sessionAnalytics} />
    </div>
  )
}
