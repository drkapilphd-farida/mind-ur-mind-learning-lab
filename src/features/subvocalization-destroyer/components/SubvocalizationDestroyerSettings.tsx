'use client'

import Link from 'next/link'
import { BrandWatermark } from '@/components/brand/BrandWatermark'
import { useIsEmbeddedExercise } from '@/features/thirty-day-curriculum/embeddedExerciseContext'
import { Button } from '@/components/ui/button'
import { WhyThisDrillWorks } from '@/components/exercises/WhyThisDrillWorks'

// Deliberately its own 600-1200 band, not the standard 100-500 every other
// Reading Mode offers — the whole premise of this exercise is forcing
// visual-to-meaning processing fast enough that inner speech physically
// cannot keep pace with it, which only starts to bite meaningfully north
// of typical subvocalization speed (roughly 250-450 WPM for most adult
// readers). 800 is the default (see SubvocalizationDestroyerExperience.tsx's
// own identical constant, passed as useReadingRuntime's initialTargetWpm so
// the two always agree): fast enough to feel genuinely disruptive to
// subvocalization on a first attempt, without being so extreme that a
// first-timer sees nothing but a blur.
const TARGET_WPM_OPTIONS = [600, 700, 800, 900, 1000, 1100, 1200] as const

type SubvocalizationDestroyerSettingsProps = {
  targetWpm: number
  onSelectTargetWpm: (wpm: number) => void
  onStart: () => void
  categoryLabel: string | null
}

export function SubvocalizationDestroyerSettings({
  targetWpm,
  onSelectTargetWpm,
  onStart,
  categoryLabel,
}: SubvocalizationDestroyerSettingsProps): React.JSX.Element {
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
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Subvocalization Destroyer™</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          An ultra-high-speed word stream, faster than your inner voice can keep up with. 3 quick questions check
          what stuck.
        </p>
        {/* Deliberately rendered as null on both the server and the
            client's first paint (only ever set from a useEffect in the
            Experience orchestrator, never a lazy state initializer) — see
            subvocalizationDestroyerDataset.ts's pickSessionCategory doc
            comment for why, to avoid a hydration mismatch. */}
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

      <WhyThisDrillWorks>
        600 to 1200 words per minute — fast enough to force your eyes to process meaning directly, without
        subvocalizing.
      </WhyThisDrillWorks>

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
