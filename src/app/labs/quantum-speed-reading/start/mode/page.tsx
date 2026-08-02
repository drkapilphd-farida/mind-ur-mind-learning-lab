import type { Metadata } from 'next'
import { READING_MODES } from '@/features/quantum-speed-reading/readingModes'
import { ReadingModeCard } from '@/features/quantum-speed-reading/components/ReadingModeCard'
import { SprintStepIndicator } from '@/features/quantum-speed-reading/components/SprintStepIndicator'

export const metadata: Metadata = {
  title: 'Choose Your Reading Mode — Quantum Speed Reading™',
}

type ModeSelectPageProps = {
  searchParams: Promise<{ mode?: string | undefined }>
}

// Screen 2 — selection is navigation (clicking a card links straight to
// Passage Selection with `?mode=...`), the same pattern the assessments
// flow already uses. Presentational only this sprint — the chosen mode
// carries forward in the URL for a future Adaptive Engine, but doesn't
// filter or gate anything yet.
export default async function ModeSelectPage({ searchParams }: ModeSelectPageProps): Promise<React.JSX.Element> {
  const params = await searchParams

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
      <SprintStepIndicator currentStep={2} />

      <div className="mt-10 text-center">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl">
          Choose Your Reading Mode
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Pick the pace that matches how you want to train today.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {READING_MODES.map((mode) => (
          <ReadingModeCard
            key={mode.id}
            mode={mode}
            href={`/labs/quantum-speed-reading/start/passage?mode=${mode.id}`}
            isSelected={params.mode === mode.id}
          />
        ))}
      </div>
    </div>
  )
}
