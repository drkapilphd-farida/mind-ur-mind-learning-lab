import { getPracticeSessions } from '@/lib/exercises/queries/getPracticeSessions'
import { computeDailyStreak, computeTodaysProgress } from '@/lib/exercises/practiceHistory'
import { getDailyQuantumSessionHistory } from '@/app/unified-quantum-session-preview/actions/getDailyQuantumSessionHistory'
import { getQuantumDocumentSessionHistory } from '@/features/quantum-document-transformer/actions/getQuantumDocumentSessionHistory'
import { getQuantumDocumentChapterScores } from '@/features/quantum-document-transformer/actions/getQuantumDocumentChapterScores'
import { getQuantumDocumentCount } from '@/features/quantum-document-transformer/getQuantumDocumentCount'
import { getCurriculumDayCompletions } from '@/features/thirty-day-curriculum/actions/getCurriculumDayCompletions'
import { computeComprehensionSummary, computeDocumentMasterySummary } from '../comprehensionStats'
import { TodaysStatusCard } from './TodaysStatusCard'
import { ReadingSpeedTrendCard } from './ReadingSpeedTrendCard'
import { ComprehensionScoreCard } from './ComprehensionScoreCard'
import { ChapterScoresCard } from './ChapterScoresCard'
import { ConsistencyCard } from './ConsistencyCard'
import { CurriculumProgressCard } from './CurriculumProgressCard'
import { CurriculumSessionHistoryCard } from './CurriculumSessionHistoryCard'
import { DocumentMasteryCard } from './DocumentMasteryCard'
import { PremiumUpsellCard } from './PremiumUpsellCard'

type ParentDashboardProps = {
  userId: string
}

// Parents Dashboard™ — real data now. Wired to the signed-in account's
// own activity (practice_sessions, daily_quantum_sessions,
// quantum_document_sessions, quantum_documents) rather than a specific
// linked child: there is no parent↔child relationship anywhere in this
// schema yet (families/family_members exist but every function that
// would create a family or link a child throws NotImplementedError —
// a separate, larger project), so "whose data" can only honestly mean
// the signed-in account's own, not a chosen child's. The multi-child
// switcher this page used to show over mock data is gone for the same
// reason — it can't work without that missing feature.
//
// A Server Component (not 'use client') — the only interactive piece
// left is the 7/14/30-day toggle inside ReadingSpeedTrendCard, which is
// its own small client island.
export async function ParentDashboard({ userId }: ParentDashboardProps): Promise<React.JSX.Element> {
  const [practiceSessions, dailyQuantumSessions, documentSessions, documentCount, chapterScores, curriculumCompletions] = await Promise.all([
    getPracticeSessions('quantum-speed-reading'),
    getDailyQuantumSessionHistory(90),
    getQuantumDocumentSessionHistory(500),
    getQuantumDocumentCount(userId),
    getQuantumDocumentChapterScores(),
    getCurriculumDayCompletions(),
  ])

  const todaysProgress = computeTodaysProgress(practiceSessions)
  const streak = computeDailyStreak(practiceSessions)
  const comprehensionSummary = computeComprehensionSummary(documentSessions)
  const masterySummary = computeDocumentMasterySummary(documentCount, documentSessions)

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <p className="text-2xl font-bold tracking-tight text-foreground">Your Progress</p>
          <p className="mt-1 text-sm font-medium text-muted-foreground">A weekly view of reading practice, comprehension, and consistency.</p>
        </div>

        {/* Strict order per spec — only adjacent items (comprehension and
            consistency) are paired side by side; nothing else is reordered
            to fit a grid. Transparent Comprehension Scoring™ (Phase 4)
            adds Chapter Scores right after Document Mastery — the same
            aggregate-then-drill-down order those two cards already have
            (avg. comprehension % → the exact per-chapter numbers behind
            it). Two-Pillar Simplification™ adds Daily Curriculum Progress
            and Session History right after Consistency — the 30-Day
            Masterclass's own real, cross-device progress (see
            curriculum_day_completions / syncCurriculumDayCompletion.ts),
            grouped before the separate Document Mastery Studio section. */}
        <TodaysStatusCard practicedToday={todaysProgress.exercisesCompletedToday > 0} minutesSpentMs={todaysProgress.totalDurationMsToday} />

        <ReadingSpeedTrendCard sessions={dailyQuantumSessions} />

        <div className="grid gap-6 sm:grid-cols-2">
          <ComprehensionScoreCard averagePercent={comprehensionSummary.averagePercent} trendDelta={comprehensionSummary.trendDelta} />
          <ConsistencyCard currentStreak={streak.currentStreak} bestStreak={streak.bestStreak} />
        </div>

        <CurriculumProgressCard completions={curriculumCompletions} />

        <CurriculumSessionHistoryCard completions={curriculumCompletions} />

        <DocumentMasteryCard documentsCompleted={masterySummary.documentsCompleted} averageComprehensionPercent={masterySummary.averageComprehensionPercent} />

        <ChapterScoresCard chapters={chapterScores} />

        <PremiumUpsellCard href="/pricing#family-pro" />
      </div>
    </div>
  )
}
