import type { Metadata } from 'next'
import { LabNavHeader } from '@/features/quantum-speed-reading/components/shell/LabNavHeader'
import { getPracticeSessionsForExercises } from '@/lib/exercises/queries/getPracticeSessionsForExercises'
import { RIGHT_BRAIN_HUB_MODES, RIGHT_BRAIN_HUB_AVAILABLE_EXERCISE_IDS } from '@/features/right-brain-hub/rightBrainHubModes'
import { RightBrainHubModeCard } from '@/features/right-brain-hub/components/RightBrainHubModeCard'

export const metadata: Metadata = {
  title: 'Right Brain Activation Hub — Quantum Speed Reading Lab™',
  description: 'Gamified right-brain and photographic-memory training exercises, alongside your real progress.',
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

// The Right Brain Activation Hub — a pure navigation/aggregation layer
// mirroring intuition-hub/page.tsx's/reading-hub/page.tsx's own structure,
// scoped to gamified right-brain/photographic-memory exercises. Real data
// throughout: Best Score comes from localStorage (client-side, via the
// mode card); Last Practised comes from real practice_sessions rows,
// filtered server-side to just this hub's own exercises via
// getPracticeSessionsForExercises (unmodified, the same generic query
// Reading Hub/Intuition Hub already use).
export default async function RightBrainHubPage(): Promise<React.JSX.Element> {
  const sessions = await getPracticeSessionsForExercises('quantum-speed-reading', RIGHT_BRAIN_HUB_AVAILABLE_EXERCISE_IDS, 200)

  return (
    <div>
      <LabNavHeader currentSection="Right Brain Activation Hub" />
      <div className="mx-auto max-w-3xl space-y-10 px-6 py-16">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Right Brain Activation Hub</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gamified exercises that train fast visual memory and pattern recognition — starting with a photographic
            mandala dash.
          </p>
        </div>

        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">Right Brain Exercises</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {RIGHT_BRAIN_HUB_MODES.map((mode) => {
              const lastSession = sessions.find((session) => session.exerciseId === mode.exerciseId) ?? null
              return (
                <RightBrainHubModeCard
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
