'use client'

import Link from 'next/link'
import { BrandWatermark } from '@/components/brand/BrandWatermark'
import { useIsEmbeddedExercise } from '@/features/thirty-day-curriculum/embeddedExerciseContext'
import { WhyThisDrillWorks } from '@/components/exercises/WhyThisDrillWorks'
import { ZENER_SYMBOLS, ZENER_DECK_SIZE } from '../espZenerDataset'

type EspZenerTelepathySettingsProps = {
  onStart: () => void
}

// ESP Zener Card Telepathy Sprint™ — no per-attempt configuration exists
// (the deck is always the classic 25-card shuffle, and there's no target-
// pace concept for a pure guessing task), so this screen is purely the
// instructions/intro gate every advanced exercise has before Start — same
// visual convention as SchulteGridDrillSettings.tsx.
export function EspZenerTelepathySettings({ onStart }: EspZenerTelepathySettingsProps): React.JSX.Element {
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
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">ESP Zener Card Telepathy Sprint™</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          A hidden symbol is drawn each round. Don&apos;t think it through — tap the symbol your gut feels is right.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
        {ZENER_SYMBOLS.map((symbol) => (
          <span key={symbol.id} className="rounded-full border border-border px-3 py-1">
            {symbol.label}
          </span>
        ))}
      </div>

      <WhyThisDrillWorks>
        Drawn from a shuffled {ZENER_DECK_SIZE}-card Zener deck. Consecutive correct guesses build a streak
        multiplier for bonus points.
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
