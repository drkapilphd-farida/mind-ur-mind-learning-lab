import type { Metadata } from 'next'
import { getReadingIntelligenceSessions } from '@/features/quantum-speed-reading/adaptive-intelligence/readingIntelligenceQueries'
import { computeReadingProfile } from '@/features/quantum-speed-reading/adaptive-intelligence/readingProfileEngine'
import { generateMonthlyInsight } from '@/features/quantum-speed-reading/ai-reading-coach/monthlyInsightEngine'
import { ReportHeader } from '@/features/quantum-speed-reading/components/reports/ReportHeader'
import { ReadingProfileStats } from '@/features/quantum-speed-reading/components/adaptive-intelligence/ReadingProfileStats'
import { MonthlyInsightCard } from '@/features/quantum-speed-reading/components/ai-reading-coach/MonthlyInsightCard'
import { ReadingHistoryTable } from '@/features/quantum-speed-reading/components/adaptive-intelligence/ReadingHistoryTable'

export const metadata: Metadata = {
  title: 'Monthly Report — Reading Intelligence Lab™',
}

const DAY_MS = 86_400_000
const MONTH_DAYS = 30

// Sprint-6, Part 4 — Monthly Report. Mirrors the Weekly Report exactly,
// just widened to a 30-day window, reusing the new monthlyInsightEngine.ts
// (additive, Sprint-5's weeklyInsightEngine.ts untouched) and Sprint-4's
// computeReadingProfile over this month's sessions.
export default async function MonthlyReportPage(): Promise<React.JSX.Element> {
  const sessions = await getReadingIntelligenceSessions()
  const now = Date.now()
  const thisMonthSessions = sessions.filter(
    (s) => s.completed && Math.floor((now - new Date(s.occurredAt).getTime()) / DAY_MS) <= MONTH_DAYS,
  )

  const monthlyProfile = computeReadingProfile(thisMonthSessions)
  const insight = generateMonthlyInsight(sessions)
  const generatedAtLabel = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })

  return (
    <div>
      <div className="mx-auto max-w-2xl px-6 py-16">
        <ReportHeader eyebrow="Monthly Report" title="This Month's Reading Growth" generatedAtLabel={generatedAtLabel} />

        <div className="mt-8 space-y-6">
          <div data-report-section>
            <ReadingProfileStats profile={monthlyProfile} />
          </div>

          <div data-report-section>
            <MonthlyInsightCard insight={insight} />
          </div>

          <div data-report-section>
            <p className="mb-3 text-xs font-medium tracking-widest text-muted-foreground uppercase">This Month&apos;s Sessions</p>
            <ReadingHistoryTable sessions={thisMonthSessions} />
          </div>
        </div>
      </div>
    </div>
  )
}
