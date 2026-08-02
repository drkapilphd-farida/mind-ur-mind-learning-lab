import type { Metadata } from 'next'
import { LabNavHeader } from '@/features/quantum-speed-reading/components/shell/LabNavHeader'
import { getPracticeSessionsForExercises } from '@/lib/exercises/queries/getPracticeSessionsForExercises'
import { VISUALIZATION_HUB_MODES, VISUALIZATION_HUB_AVAILABLE_EXERCISE_IDS } from '@/features/visualization-hub/visualizationHubModes'
import { VisualizationHubModeCard } from '@/features/visualization-hub/components/VisualizationHubModeCard'

export const metadata: Metadata = {
  title: 'Visualization Development Hub — Quantum Speed Reading Lab™',
  description: 'Gamified mental-visualization and spatial-reasoning training exercises, alongside your real progress.',
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

// The Visualization Development Hub — a pure navigation/aggregation
// layer mirroring right-brain-hub/page.tsx's/intuition-hub/page.tsx's
// own structure, scoped to gamified mental-visualization exercises. Real
// data throughout: Best Score comes from localStorage (client-side, via
// the mode card); Last Practised comes from real practice_sessions rows,
// filtered server-side to just this hub's own exercises via
// getPracticeSessionsForExercises (unmodified, the same generic query
// every sibling hub already uses).
export default async function VisualizationHubPage(): Promise<React.JSX.Element> {
  const sessions = await getPracticeSessionsForExercises('quantum-speed-reading', VISUALIZATION_HUB_AVAILABLE_EXERCISE_IDS, 200)

  return (
    <div>
      <LabNavHeader currentSection="Visualization Development Hub" />
      <div className="mx-auto max-w-3xl space-y-10 px-6 py-16">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Visualization Development Hub</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gamified exercises that train mental rotation and spatial reasoning — starting with a colored 3D object
            rotation challenge.
          </p>
        </div>

        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">Visualization Exercises</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {VISUALIZATION_HUB_MODES.map((mode) => {
              const lastSession = sessions.find((session) => session.exerciseId === mode.exerciseId) ?? null
              return (
                <VisualizationHubModeCard
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
