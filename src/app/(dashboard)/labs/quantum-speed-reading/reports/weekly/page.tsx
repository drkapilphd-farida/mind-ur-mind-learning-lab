import type { Metadata } from 'next'
import { getReadingIntelligenceSessions } from '@/features/quantum-speed-reading/adaptive-intelligence/readingIntelligenceQueries'
import { computeReadingProfile } from '@/features/quantum-speed-reading/adaptive-intelligence/readingProfileEngine'
import { generateWeeklyInsight } from '@/features/quantum-speed-reading/ai-reading-coach/weeklyInsightEngine'
import { ReportHeader } from '@/features/quantum-speed-reading/components/reports/ReportHeader'
import { ReadingProfileStats } from '@/features/quantum-speed-reading/components/adaptive-intelligence/ReadingProfileStats'
import { WeeklyInsightCard } from '@/features/quantum-speed-reading/components/ai-reading-coach/WeeklyInsightCard'
import { ReadingHistoryTable } from '@/features/quantum-speed-reading/components/adaptive-intelligence/ReadingHistoryTable'

export const metadata: Metadata = {
  title: 'Weekly Report — Reading Intelligence Lab™',
}

const DAY_MS = 86_400_000

// Sprint-6, Part 4 — Weekly Report. Reuses generateWeeklyInsight (Sprint-5,
// unmodified) for the insight sentence, and computeReadingProfile (Sprint-4,
// unmodified) over just this week's sessions for the metrics grid — no new
// scoring logic, only a 7-day window applied before rendering.
export default async function WeeklyReportPage(): Promise<React.JSX.Element> {
  const sessions = await getReadingIntelligenceSessions()
  const now = Date.now()
  const thisWeekSessions = sessions.filter(
    (s) => s.completed && Math.floor((now - new Date(s.occurredAt).getTime()) / DAY_MS) <= 7,
  )

  const weeklyProfile = computeReadingProfile(thisWeekSessions)
  const insight = generateWeeklyInsight(sessions)
  const generatedAtLabel = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })

  return (
    <div>
      <div className="mx-auto max-w-2xl px-6 py-16">
        <ReportHeader eyebrow="Weekly Report" title="This Week's Reading Growth" generatedAtLabel={generatedAtLabel} />

        <div className="mt-8 space-y-6">
          <div data-report-section>
            <ReadingProfileStats profile={weeklyProfile} />
          </div>

          <div data-report-section>
            <WeeklyInsightCard insight={insight} />
          </div>

          <div data-report-section>
            <p className="mb-3 text-xs font-medium tracking-widest text-muted-foreground uppercase">This Week&apos;s Sessions</p>
            <ReadingHistoryTable sessions={thisWeekSessions} />
          </div>
        </div>
      </div>
    </div>
  )
}
