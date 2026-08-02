'use client'

import { ReadingStatTile } from '@/features/reading-engine/components/ReadingStatTile'
import { formatElapsedTime } from '@/features/quantum-speed-reading/readingSessionEngine'

type RapidVisualSpanExpanderRoundTransitionProps = {
  roundLabel: string
  wordsFlashed: number
  roundElapsedMs: number
  isLastRound: boolean
  nextTargetWpm: number
  onNext: () => void
  onExit: () => void
}

// Pure Timed Progression Sprint — replaces the earlier MCQ recall gate
// entirely. There is nothing to answer and nothing to pass/fail: every
// completed round always continues, since this is now a pure
// speed-and-peripheral training session, not a comprehension check. This
// screen is purely a breather between timed rounds — a quick glance at
// what just happened, then an explicit "Next" click hands control to the
// next round at a programmatically higher target WPM (auto speed-up).
// Manual click (not a timed auto-advance) so the user keeps control of
// pacing between rounds and reduced-motion/attention needs are respected.
export function RapidVisualSpanExpanderRoundTransition({
  roundLabel,
  wordsFlashed,
  roundElapsedMs,
  isLastRound,
  nextTargetWpm,
  onNext,
  onExit,
}: RapidVisualSpanExpanderRoundTransitionProps): React.JSX.Element {
  return (
    <div className="relative mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <button
        onClick={onExit}
        className="absolute top-4 right-6 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
        aria-label="Exit exercise"
      >
        Exit
      </button>

      <div>
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">{roundLabel} complete</p>
        <h1 className="font-heading mt-2 text-2xl font-bold tracking-tight text-foreground">Nice focus.</h1>
      </div>

      <div className="grid w-full grid-cols-2 gap-4">
        <ReadingStatTile variant="card" label="Words Flashed" value={String(wordsFlashed)} />
        <ReadingStatTile variant="card" label="Round Time" value={formatElapsedTime(roundElapsedMs)} />
      </div>

      <button
        type="button"
        onClick={onNext}
        className="w-full max-w-xs rounded-full bg-foreground px-8 py-3 text-sm font-medium text-background transition-all duration-150 hover:opacity-80 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {isLastRound ? 'Finish' : `Next — ${nextTargetWpm} WPM`}
      </button>
    </div>
  )
}
