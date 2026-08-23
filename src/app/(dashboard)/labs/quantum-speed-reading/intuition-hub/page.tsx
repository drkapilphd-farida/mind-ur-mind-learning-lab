import type { Metadata } from 'next'
import { getPracticeSessionsForExercises } from '@/lib/exercises/queries/getPracticeSessionsForExercises'
import { INTUITION_HUB_MODES, INTUITION_HUB_AVAILABLE_EXERCISE_IDS } from '@/features/intuition-hub/intuitionHubModes'
import { IntuitionHubModeCard } from '@/features/intuition-hub/components/IntuitionHubModeCard'

export const metadata: Metadata = {
  title: 'Intuition Development Hub — Quantum Speed Reading Lab™',
  description: 'Gamified intuition and ESP training exercises, alongside your real progress.',
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

// The Intuition Development Hub — a pure navigation/aggregation layer
// mirroring reading-hub/page.tsx's own structure, scoped to gamified
// intuition/ESP exercises instead of Master Reading Engine modes. Real
// data throughout: Best Accuracy comes from localStorage (client-side, via
// the mode card); Last Practised comes from real practice_sessions rows,
// filtered server-side to just this hub's own exercises via
// getPracticeSessionsForExercises (unmodified, the same generic query
// Reading Hub already uses).
export default async function IntuitionHubPage(): Promise<React.JSX.Element> {
  const sessions = await getPracticeSessionsForExercises('quantum-speed-reading', INTUITION_HUB_AVAILABLE_EXERCISE_IDS, 200)

  return (
    <div>
      <div className="mx-auto max-w-3xl space-y-10 px-6 py-16">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Intuition Development Hub</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gamified exercises that train gut-level pattern sense — starting with a classic ESP Zener card sprint.
          </p>
        </div>

        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">Intuition Exercises</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {INTUITION_HUB_MODES.map((mode) => {
              const lastSession = sessions.find((session) => session.exerciseId === mode.exerciseId) ?? null
              return (
                <IntuitionHubModeCard
                  key={mode.id}
                  mode={mode}
                  lastPractisedLabel={lastSession !== null ? formatDateLabel(lastSession.occurredAt) : null}
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
