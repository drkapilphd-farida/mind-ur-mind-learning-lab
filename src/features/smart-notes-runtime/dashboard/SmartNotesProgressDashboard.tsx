import { NotebookText } from 'lucide-react'
import { EmptyStateCard } from '@/components/ui/empty-state-card'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import { getSmartNotesAnalyticsDashboard } from '../actions/getSmartNotesAnalyticsDashboard'
import { SmartNotesSummaryCards } from './SmartNotesSummaryCards'
import { SmartNotesPerformanceTimeline } from './SmartNotesPerformanceTimeline'
import { SmartNotesEngagementIndicators } from './SmartNotesEngagementIndicators'
import { SmartNotesSessionAnalyticsList } from './SmartNotesSessionAnalyticsList'
import { SmartNotesSessionComparisonCard } from './SmartNotesSessionComparisonCard'
import { SmartNotesImprovementInsightsCard } from './SmartNotesImprovementInsightsCard'

// Smart Notes™ Sprint-4 — Analytics & Insights™. The real top-level
// orchestrator, an async Server Component fetching once from
// `getSmartNotesAnalyticsDashboard` and composing every other widget
// this sprint built from that single result. No client boundary
// anywhere in this tree — the whole dashboard is read-only. Mirrors
// Memory Mode™'s own `MemoryProgressDashboard` (Sprint-4) exactly.
//
// Smart Notes™ Sprint-5 polish: a soft page-level fade-in, a slightly
// earlier header entrance, small horizontal breathing room on mobile,
// and matching fade-ins on both real empty states — matching Memory's
// own Sprint-5 treatment exactly. No section, no data shape, no fetch
// call changed.
export async function SmartNotesProgressDashboard(): Promise<React.JSX.Element> {
  const result = await getSmartNotesAnalyticsDashboard()

  if (!result.success) {
    return (
      <div className="animate-in fade-in mx-auto max-w-lg px-6 py-16 duration-(--duration-slow)">
        <EmptyStateCard icon={NotebookText} title="Sign in to see your smart notes analytics" description={result.error} />
      </div>
    )
  }

  const { dashboard } = result

  if (dashboard.profile.sessionsCompleted === 0 && dashboard.sessionAnalytics.length === 0) {
    return (
      <div className="animate-in fade-in mx-auto max-w-lg px-6 py-16 duration-(--duration-slow)">
        <EmptyStateCard icon={NotebookText} title="No smart notes sessions yet" description="Complete your first Smart Notes session to start seeing real analytics and insights here." />
      </div>
    )
  }

  return (
    <div className="space-y-8 px-1 pb-4 sm:px-0">
      <div className="animate-in fade-in slide-in-from-top-1 duration-(--duration-base)">
        <p className={TYPOGRAPHY.label}>Smart Notes™</p>
        <h1 className={cn(TYPOGRAPHY.h1, 'mt-1')}>Your Smart Notes Progress</h1>
      </div>

      <SmartNotesSummaryCards cards={dashboard.summaryCards} />

      <SmartNotesPerformanceTimeline timeline={dashboard.timeline} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SmartNotesEngagementIndicators distribution={dashboard.engagementDistribution} />
        <SmartNotesSessionComparisonCard comparison={dashboard.comparison} />
      </div>

      <SmartNotesImprovementInsightsCard insights={dashboard.insights} />

      <SmartNotesSessionAnalyticsList sessionAnalytics={dashboard.sessionAnalytics} />
    </div>
  )
}
