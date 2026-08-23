'use client'

import Link from 'next/link'
import { BrandWatermark } from '@/components/brand/BrandWatermark'
import { useIsEmbeddedExercise } from '@/features/thirty-day-curriculum/embeddedExerciseContext'

type SchulteGridDrillSettingsProps = {
  onStart: () => void
}

// Schulte Grid Speed Drill™ — no per-attempt configuration exists (grid
// size is fixed at 5×5, and there is no target-pace concept for a
// click-search task), so this screen is purely the instructions/intro
// gate every mode has before Start — same visual convention as every
// other mode's own Settings screen (centered column, min-h-[70vh], Exit
// top-right), just with nothing to actually configure.
export function SchulteGridDrillSettings({ onStart }: SchulteGridDrillSettingsProps): React.JSX.Element {
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
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Peripheral Vision Activator™</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          A 5×5 grid of shuffled numbers. Find and tap 1 through 25 in order, as fast as you can — a quick warmup for
          visual focus and peripheral search before a reading session.
        </p>
      </div>

      <button
        onClick={onStart}
        className="rounded-full bg-foreground px-10 py-3 text-sm font-medium text-background transition-all duration-150 hover:opacity-80 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Start
      </button>
    </div>
  )
}
