'use client'

import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

const PREPARATION_INSTRUCTIONS = [
  'Observe only the golden fixation point.',
  'Keep your eyes relaxed.',
  'Avoid unnecessary blinking.',
  'When the flame disappears, close your eyes naturally.',
  'Observe the after-image.',
] as const

const DURATION_OPTIONS = [15, 30, 45, 60, 90] as const
const DEFAULT_DURATION_SECONDS = 45

type CandleTratakPreparationScreenProps = {
  onStart: (durationSeconds: number) => void
  // Advanced Tratak™ reuses this exact screen for a longer, harder round —
  // these three are cosmetic only and default to the standalone Candle
  // Tratak™ route's exact current copy/duration when omitted.
  missionLabel?: string
  title?: string
  defaultDurationSeconds?: number
}

// Small local duplicate of ImagePersistencePreparationScreen.tsx's exact
// pattern (candle-specific copy), not a cross-import — established
// convention for mission-specific screens in this feature.
export function CandleTratakPreparationScreen({
  onStart,
  missionLabel = 'Mission 1',
  title = 'Candle Tratak™',
  defaultDurationSeconds = DEFAULT_DURATION_SECONDS,
}: CandleTratakPreparationScreenProps): React.JSX.Element {
  const [durationSeconds, setDurationSeconds] = useState<number>(defaultDurationSeconds)
  const prefersReducedMotion = usePrefersReducedMotion()
  const fadeClass = !prefersReducedMotion ? 'animate-in fade-in slide-in-from-bottom-2 duration-300' : ''

  return (
    <div className={cn('mx-auto flex w-full max-w-md flex-col items-center gap-8 text-center', fadeClass)}>
      <div>
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">{missionLabel}</p>
        <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sustained fixation builds the visual persistence your eyes rely on to hold words in view.
        </p>
      </div>

      <div className="w-full rounded-2xl border bg-card p-6 text-left shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-muted-foreground" aria-hidden="true" />
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Before You Begin</p>
        </div>
        <ul className="mt-3 space-y-2.5">
          {PREPARATION_INSTRUCTIONS.map((instruction) => (
            <li key={instruction} className="flex items-center gap-2.5 text-sm text-foreground">
              <span className="size-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              {instruction}
            </li>
          ))}
        </ul>
      </div>

      <div className="w-full">
        <p className="text-left text-xs font-medium tracking-widest text-muted-foreground uppercase">Session Timer</p>
        <div className="mt-2 grid grid-cols-5 gap-1.5" role="group" aria-label="Session timer">
          {DURATION_OPTIONS.map((seconds) => (
            <button
              key={seconds}
              type="button"
              onClick={() => setDurationSeconds(seconds)}
              aria-pressed={durationSeconds === seconds}
              className={cn(
                'flex min-h-[48px] items-center justify-center rounded-xl border px-2 py-2 text-center text-xs font-medium transition-all duration-150',
                'hover:bg-muted hover:border-foreground/20 active:scale-[0.98]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                durationSeconds === seconds ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-card text-foreground',
              )}
            >
              {seconds}s
            </button>
          ))}
        </div>
      </div>

      <Button
        size="lg"
        className={cn('w-full rounded-full', !prefersReducedMotion && 'transition-transform active:scale-[0.98]')}
        onClick={() => onStart(durationSeconds)}
      >
        Begin Tratak
      </Button>
    </div>
  )
}
