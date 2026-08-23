import type { Metadata } from 'next'
import { getPracticeSessionsForExercises } from '@/lib/exercises/queries/getPracticeSessionsForExercises'
import { computeDailyStreak, computeTodaysProgress } from '@/lib/exercises/practiceHistory'
import { READING_HUB_MODES, READING_HUB_AVAILABLE_EXERCISE_IDS } from '@/features/reading-hub/readingHubModes'
import { ReadingHubModeCard } from '@/features/reading-hub/components/ReadingHubModeCard'
import { ReadingHubRecentActivity, type ReadingHubRecentActivityRecord } from '@/features/reading-hub/components/ReadingHubRecentActivity'
import { ReadingHubProgressSummary } from '@/features/reading-hub/components/ReadingHubProgressSummary'

export const metadata: Metadata = {
  title: 'Reading Hub — Quantum Speed Reading Lab™',
  description: 'Every Master Reading Engine mode, your recent activity, and your real progress — in one place.',
}

function formatDateLabel(occurredAt: string): string {
  const dayMs = 86_400_000
  const occurredDateKey = occurredAt.slice(0, 10)
  const todayKey = new Date().toISOString().slice(0, 10)
  const daysAgo = Math.round((new Date(todayKey).getTime() - new Date(occurredDateKey).getTime()) / dayMs)
  if (daysAgo <= 0) return 'Today'
  if (daysAgo === 1) return 'Yesterday'
  return `${daysAgo} days ago`
}

// Sprint 3.3A — Reading Hub Experience™. A pure navigation/aggregation
// layer built on top of the Master Reading Engine and its 3 existing
// modes — none of the engine, the modes, or the shared 3.2A shell are
// touched here. Real data throughout: Best Reading Pace comes from
// localStorage (client-side, via the mode cards / progress summary); Last
// Practised, Today's Practice Time, Sessions Completed, and Current
// Streak all come from real practice_sessions rows, filtered server-side
// to just these 3 modes via getPracticeSessionsForExercises. Recent
// Activity's Reading Pace/Completion are honestly marked "Not tracked yet"
// rather than fabricated — practice_sessions has no WPM/completion-percent
// column, by the engine's own deliberate design.
export default async function ReadingHubPage(): Promise<React.JSX.Element> {
  const sessions = await getPracticeSessionsForExercises('quantum-speed-reading', READING_HUB_AVAILABLE_EXERCISE_IDS, 200)

  const todayKey = new Date().toISOString().slice(0, 10)
  const todaysSessions = sessions.filter((session) => session.occurredAt.slice(0, 10) === todayKey)
  const { totalDurationMsToday } = computeTodaysProgress(sessions)
  const sessionsCompletedToday = todaysSessions.filter((session) => session.completed).length

  const streak = computeDailyStreak(sessions)

  const mostRecentSession = sessions[0] ?? null
  const mostRecentModeTitle = READING_HUB_MODES.find((mode) => mode.exerciseId === mostRecentSession?.exerciseId)?.title ?? 'Reading Mode'
  const recentActivityRecord: ReadingHubRecentActivityRecord | null =
    mostRecentSession === null
      ? null
      : { modeTitle: mostRecentModeTitle, durationMs: mostRecentSession.durationMs, completed: mostRecentSession.completed }

  return (
    <div>
      <div className="mx-auto max-w-3xl space-y-10 px-6 py-16">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Reading Hub</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Every Reading Mode, your recent activity, and your real progress — all in one place.
          </p>
        </div>

        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">Reading Modes</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {READING_HUB_MODES.map((mode) => {
              const lastSession = sessions.find((session) => session.exerciseId === mode.exerciseId) ?? null
              return (
                <ReadingHubModeCard
                  key={mode.id}
                  mode={mode}
                  lastPractisedLabel={lastSession !== null ? formatDateLabel(lastSession.occurredAt) : null}
                />
              )
            })}
          </div>
        </div>

        <ReadingHubRecentActivity record={recentActivityRecord} />

        <ReadingHubProgressSummary
          todaysPracticeMs={totalDurationMsToday}
          sessionsCompletedToday={sessionsCompletedToday}
          currentStreakDays={streak.currentStreak}
        />
      </div>
    </div>
  )
}
