'use client'

import Link from 'next/link'
import { ReadingStatTile } from '@/features/reading-engine/components/ReadingStatTile'
import { formatElapsedTime } from '@/features/quantum-speed-reading/readingSessionEngine'
import type { BrainGymDrillConfig } from '../types'

type BrainGymDrillCompleteScreenProps = {
  config: BrainGymDrillConfig
  elapsedMs: number
  correctCount: number
  bestStreak: number
  averageReactionMs: number
  bestAccuracyPercentAllTime: number
  bestStreakAllTime: number
  onPlayAgain: () => void
}

// Same visual convention as EspZenerTelepathyCompleteScreen.tsx —
// millisecond reaction time and accuracy% only, deliberately no WPM/
// words-read figure anywhere on this screen (Metric Separation™: WPM is
// reserved for the reading/sprint modules, never a Brain Gym drill).
export function BrainGymDrillCompleteScreen({
  config,
  elapsedMs,
  correctCount,
  bestStreak,
  averageReactionMs,
  bestAccuracyPercentAllTime,
  bestStreakAllTime,
  onPlayAgain,
}: BrainGymDrillCompleteScreenProps): React.JSX.Element {
  const accuracyPercent = Math.round((correctCount / config.roundCount) * 100)

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-10 px-6 py-16 text-center">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">{config.completeHeading}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{config.completeSubline}</p>
      </div>

      <div className="grid w-full grid-cols-2 gap-4">
        <ReadingStatTile variant="card" label="Accuracy" value={`${accuracyPercent}%`} />
        <ReadingStatTile variant="card" label="Best Streak" value={String(bestStreak)} />
        <ReadingStatTile variant="card" label="Avg Reaction" value={`${averageReactionMs}ms`} />
        <ReadingStatTile variant="card" label="Time" value={formatElapsedTime(elapsedMs)} />
        <ReadingStatTile variant="card" label="Best Accuracy (All-Time)" value={`${bestAccuracyPercentAllTime}%`} />
        <ReadingStatTile variant="card" label="Best Streak (All-Time)" value={String(bestStreakAllTime)} />
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={onPlayAgain}
          className="rounded-full bg-foreground px-8 py-3 text-sm font-medium text-background transition-all duration-150 hover:opacity-80 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Play Again
        </button>
        <Link
          href="/dashboard"
          className="rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
        >
          Back to Lab
        </Link>
      </div>
    </div>
  )
}
