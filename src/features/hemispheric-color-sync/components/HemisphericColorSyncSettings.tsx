'use client'

import Link from 'next/link'
import { BrandWatermark } from '@/components/brand/BrandWatermark'
import { useIsEmbeddedExercise } from '@/features/thirty-day-curriculum/embeddedExerciseContext'
import { WhyThisDrillWorks } from '@/components/exercises/WhyThisDrillWorks'
import { ROUNDS_PER_SESSION, RECALL_TIME_LIMIT_MS } from '../hemisphericColorSyncDataset'

type HemisphericColorSyncSettingsProps = {
  onStart: () => void
}

// No per-attempt configuration exists (the recall window and round count
// are fixed, and there's no target-pace concept for a pure conflict-
// resolution task), so this screen is purely the instructions/intro gate
// every advanced exercise has before Start.
export function HemisphericColorSyncSettings({ onStart }: HemisphericColorSyncSettingsProps): React.JSX.Element {
  const isEmbedded = useIsEmbeddedExercise()
  const recallSeconds = (RECALL_TIME_LIMIT_MS / 1000).toFixed(1)

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
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Hemispheric Color-Word Sync Grid™</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          A color name flashes in a mismatched ink. Tap the swatch matching either the WORD or the INK, whichever the
          round asks for.
        </p>
      </div>

      <WhyThisDrillWorks>
        This resolves the classic Stroop conflict — training your brain to override automatic word-reading and follow
        instructions instead. You get just {recallSeconds}s per round, a streak multiplier, and a fast-reflex bonus on
        every correct hit. {ROUNDS_PER_SESSION} rounds per sprint — word and ink prompts split exactly evenly.
      </WhyThisDrillWorks>

      <button
        onClick={onStart}
        className="rounded-full bg-foreground px-10 py-3 text-sm font-medium text-background transition-all duration-150 hover:opacity-80 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Start
      </button>
    </div>
  )
}
