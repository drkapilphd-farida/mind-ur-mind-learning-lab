'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

// WPM-Based Timing Sprint — replaces the earlier raw-millisecond "Flash
// Speed" picker with a real target-WPM picker, matching every Reading
// Mode's own convention: the Master Reading Engine (useReadingRuntime)
// now drives flash timing directly (see
// RapidVisualSpanExpanderBlockRuntime.tsx), with each flashed token
// treated as one content-agnostic word unit. 175 is the required default
// starting speed. Pure Timed Progression Sprint — each round now runs for
// a fixed real-world duration at the current target WPM, with no recall
// check afterward; speed increases automatically round over round.
export const TARGET_WPM_OPTIONS = [100, 125, 150, 175, 200, 250, 300, 350] as const
export type TargetWpm = (typeof TARGET_WPM_OPTIONS)[number]
export const DEFAULT_TARGET_WPM: TargetWpm = 175

type RapidVisualSpanExpanderSettingsProps = {
  targetWpm: number
  onSelectTargetWpm: (wpm: number) => void
  onStart: () => void
}

export function RapidVisualSpanExpanderSettings({
  targetWpm,
  onSelectTargetWpm,
  onStart,
}: RapidVisualSpanExpanderSettingsProps): React.JSX.Element {
  return (
    <div className="relative mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <Link
        href="/labs/quantum-speed-reading"
        className="absolute top-4 right-6 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
      >
        Exit
      </Link>

      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Rapid Visual Span Expander™</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Keep your eyes on the center dot. Words and numbers will flash briefly across the full screen in timed
          rounds — speed increases automatically as you progress.
        </p>
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
        className="rounded-full bg-foreground px-10 py-3 text-sm font-medium text-background transition-all duration-150 hover:opacity-80 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Start
      </button>
    </div>
  )
}
