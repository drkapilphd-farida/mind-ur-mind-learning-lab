import type { Metadata } from 'next'
import { getReadingIntelligenceSessions, getSelectedReadingGoal } from '@/features/quantum-speed-reading/adaptive-intelligence/readingIntelligenceQueries'
import { computeReadingProfile } from '@/features/quantum-speed-reading/adaptive-intelligence/readingProfileEngine'
import { computeReadingDna } from '@/features/quantum-speed-reading/adaptive-intelligence/readingDnaEngine'
import { computeCategoryIntelligence } from '@/features/quantum-speed-reading/adaptive-intelligence/categoryIntelligenceEngine'
import { generateSessionFeedbackReport } from '@/features/quantum-speed-reading/ai-reading-coach/sessionFeedbackEngine'
import { recommendNextSession } from '@/features/quantum-speed-reading/ai-reading-coach/nextSessionRecommendationEngine'
import { getPassageById } from '@/features/quantum-speed-reading/passageLibrary'
import { PASSAGE_CATEGORY_LABEL, PASSAGE_DIFFICULTY_LABEL } from '@/features/quantum-speed-reading/passageDifficulty'
import { ReportHeader } from '@/features/quantum-speed-reading/components/reports/ReportHeader'
import { SessionFeedbackReport } from '@/features/quantum-speed-reading/components/ai-reading-coach/SessionFeedbackReport'
import { ReadingDnaCard } from '@/features/quantum-speed-reading/components/adaptive-intelligence/ReadingDnaCard'
import { NextSessionRecommendationCard } from '@/features/quantum-speed-reading/components/ai-reading-coach/NextSessionRecommendationCard'

export const metadata: Metadata = {
  title: 'Session Report — Reading Intelligence Lab™',
}

type SessionReportPageProps = {
  searchParams: Promise<{ session?: string | undefined }>
}

// Sprint-6, Part 4 — Session Report. Defaults to the most recent session;
// ?session=<id> selects any past one. Reuses Sprint-5's own
// generateSessionFeedbackReport/recommendNextSession + Sprint-4's
// computeReadingDna unmodified — no new scoring logic.
export default async function SessionReportPage({ searchParams }: SessionReportPageProps): Promise<React.JSX.Element> {
  const params = await searchParams
  const [sessions, selectedGoalId] = await Promise.all([getReadingIntelligenceSessions(), getSelectedReadingGoal()])

  const targetIndex = params.session ? sessions.findIndex((s) => s.id === params.session) : 0
  const target = targetIndex >= 0 ? sessions[targetIndex] ?? null : sessions[0] ?? null

  if (!target) {
    return (
      <div>
        <div className="mx-auto max-w-2xl px-6 py-16">
          <p className="text-sm text-muted-foreground">Complete a reading session to unlock your first Session Report.</p>
        </div>
      </div>
    )
  }

  const resolvedIndex = targetIndex >= 0 ? targetIndex : 0
  const priorSessions = sessions.slice(resolvedIndex + 1, resolvedIndex + 6)
  const previous = sessions[resolvedIndex + 1] ?? null

  const profile = computeReadingProfile(sessions)
  const dnaTraits = computeReadingDna(sessions)
  const categoryIntelligence = computeCategoryIntelligence(sessions)

  const feedbackReport = generateSessionFeedbackReport(target, priorSessions)
  const recommendation = recommendNextSession(profile, categoryIntelligence, target, previous, selectedGoalId)
  const passage = getPassageById(target.passageId)

  const generatedAtLabel = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })

  return (
    <div>
      <div className="mx-auto max-w-2xl px-6 py-16">
        <ReportHeader eyebrow="Session Report" title={passage?.title ?? 'Reading Session'} generatedAtLabel={generatedAtLabel} />

        <div className="mt-8 space-y-6">
          <div data-report-section className="rounded-2xl border bg-card p-6 shadow-sm">
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Session Details</p>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-xs text-muted-foreground">Category</dt>
                <dd className="font-medium text-foreground">{PASSAGE_CATEGORY_LABEL[target.category]}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Difficulty</dt>
                <dd className="font-medium text-foreground">{PASSAGE_DIFFICULTY_LABEL[target.difficulty]}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Reading Speed</dt>
                <dd className="font-medium text-foreground">{target.wpm} WPM</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Accuracy</dt>
                <dd className="font-medium text-foreground">{target.accuracyPercent}%</dd>
              </div>
            </dl>
          </div>

          <div data-report-section>
            <SessionFeedbackReport report={feedbackReport} />
          </div>

          <div data-report-section>
            <ReadingDnaCard traits={dnaTraits} />
          </div>

          {recommendation && (
            <div data-report-section>
              <NextSessionRecommendationCard recommendation={recommendation} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
