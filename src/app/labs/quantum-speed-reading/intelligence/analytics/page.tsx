import type { Metadata } from 'next'
import { getReadingIntelligenceSessions, getSelectedReadingGoal } from '@/features/quantum-speed-reading/adaptive-intelligence/readingIntelligenceQueries'
import { computeReadingProfile } from '@/features/quantum-speed-reading/adaptive-intelligence/readingProfileEngine'
import { computeCategoryPerformance } from '@/features/quantum-speed-reading/adaptive-intelligence/categoryIntelligenceEngine'
import { computeGoalProgress } from '@/features/quantum-speed-reading/adaptive-intelligence/goalProgressEngine'
import { getReadingGoal } from '@/features/quantum-speed-reading/adaptive-intelligence/goalCatalog'
import { ReadingAnalyticsCharts } from '@/features/quantum-speed-reading/components/adaptive-intelligence/ReadingAnalyticsCharts'
import { GoalProgressBar } from '@/features/quantum-speed-reading/components/adaptive-intelligence/GoalProgressBar'
import { LabNavHeader } from '@/features/quantum-speed-reading/components/shell/LabNavHeader'
import { LabPageHeader } from '@/features/quantum-speed-reading/components/shell/LabPageHeader'

export const metadata: Metadata = {
  title: 'Analytics — Quantum Speed Reading™',
}

export default async function AnalyticsPage(): Promise<React.JSX.Element> {
  const [sessions, selectedGoalId] = await Promise.all([getReadingIntelligenceSessions(), getSelectedReadingGoal()])
  const profile = computeReadingProfile(sessions)
  const categoryPerformance = computeCategoryPerformance(sessions)
  const goal = selectedGoalId ? getReadingGoal(selectedGoalId) : null

  return (
    <div>
      <LabNavHeader currentSection="Analytics" />
      <div className="mx-auto max-w-3xl px-6 py-16">
      <LabPageHeader
        eyebrow="Adaptive Intelligence Engine™"
        title="Analytics"
        subtitle="Reading speed, accuracy, comprehension, and score across your recent sessions."
      />

      <div className="mt-10 space-y-6">
        {goal && (
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <GoalProgressBar label={goal.title} percent={computeGoalProgress(goal.id, profile, sessions)} />
          </div>
        )}
        <ReadingAnalyticsCharts sessions={sessions} categoryPerformance={categoryPerformance} />
      </div>
      </div>
    </div>
  )
}
