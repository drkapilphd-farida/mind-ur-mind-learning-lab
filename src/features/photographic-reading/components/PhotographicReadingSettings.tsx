'use client'

import Link from 'next/link'
import { BrandWatermark } from '@/components/brand/BrandWatermark'
import { useIsEmbeddedExercise } from '@/features/thirty-day-curriculum/embeddedExerciseContext'
import { Button } from '@/components/ui/button'

// The same standard 100-500 band every other Reading Mode offers — unlike
// Subvocalization Destroyer's deliberately raised 600-1200 band, this
// exercise's core challenge isn't raw speed, it's spatial relocation (the
// eyes jumping to a genuinely different screen region for every cluster),
// which trains meaningfully even at ordinary reading pace.
const TARGET_WPM_OPTIONS = [100, 150, 200, 250, 300, 350, 400, 450, 500] as const

type PhotographicReadingSettingsProps = {
  targetWpm: number
  onSelectTargetWpm: (wpm: number) => void
  onStart: () => void
  categoryLabel: string | null
}

export function PhotographicReadingSettings({
  targetWpm,
  onSelectTargetWpm,
  onStart,
  categoryLabel,
}: PhotographicReadingSettingsProps): React.JSX.Element {
  const isEmbedded = useIsEmbeddedExercise()
  return (
    <div className={`relative mx-auto flex ${isEmbedded ? 'h-full' : 'min-h-[100dvh]'} max-w-md flex-col items-center justify-center gap-8 px-6 py-16 text-center`}>
      {!isEmbedded && <BrandWatermark className="absolute top-4 left-6" />}
      {!isEmbedded && (
        <Link
          href="/dashboard"
          className="absolute top-4 right-6 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
        >
          Exit
        </Link>
      )}

      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Photographic Reading™</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Meaningful word clusters flash across shifting corners of the screen — training your eyes to capture layout
          non-linearly, the foundation of photographic memory. 3 quick questions check what stuck.
        </p>
        {/* Deliberately rendered as null on both the server and the
            client's first paint (only ever set from a useEffect in the
            Experience orchestrator, never a lazy state initializer) — see
            photographicReadingDataset.ts's pickSessionCategory doc comment
            for why, to avoid a hydration mismatch. */}
        {categoryLabel && <p className="mt-2 text-xs font-medium text-muted-foreground">Today&rsquo;s reading: {categoryLabel}</p>}
      </div>

      <div className="w-full">
        <p className="mb-3 text-xs font-medium tracking-widest text-muted-foreground uppercase">Target WPM</p>
        <div className="flex flex-wrap justify-center gap-2">
          {TARGET_WPM_OPTIONS.map((wpm) => (
            <Button key={wpm} variant={wpm === targetWpm ? 'default' : 'outline'} size="sm" onClick={() => onSelectTargetWpm(wpm)}>
              {wpm}
            </Button>
          ))}
        </div>
      </div>

      <button
        onClick={onStart}
        disabled={categoryLabel === null}
        className="rounded-full bg-foreground px-10 py-3 text-sm font-medium text-background transition-all duration-150 hover:opacity-80 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {categoryLabel === null ? 'Preparing…' : 'Start'}
      </button>
    </div>
  )
}
