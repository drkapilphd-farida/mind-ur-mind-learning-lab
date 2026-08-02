'use client'

import Link from 'next/link'
import { ReadingStatTile } from '@/features/reading-engine/components/ReadingStatTile'
import { formatElapsedTime } from '@/features/quantum-speed-reading/readingSessionEngine'
import { ROUNDS_PER_SESSION, PERFECT_SESSION_BONUS } from '../photographicMemoryDataset'

type PhotographicMemoryCompleteScreenProps = {
  elapsedMs: number
  correctCount: number
  totalScore: number
  bestStreak: number
  bestScorePercentAllTime: number
  bestStreakAllTime: number
  onPlayAgain: () => void
  backHref?: string
}

// A dedicated completion screen, not a reuse of ReadingSessionCompleteScreen
// — that component's stats (Average Reading Pace, Target WPM, Words Read)
// are hard WPM-shaped and don't describe a multi-category visual-recall
// sprint honestly. Rather than fabricate a WPM/words-read number just to
// fit that shared component's prop contract, this is a small, additive
// screen matching the exact same visual language/classes as every
// sibling gamified exercise's own completion screen, without modifying
// or forking the locked component itself.
export function PhotographicMemoryCompleteScreen({
  elapsedMs,
  correctCount,
  totalScore,
  bestStreak,
  bestScorePercentAllTime,
  bestStreakAllTime,
  onPlayAgain,
  backHref = '/labs/quantum-speed-reading',
}: PhotographicMemoryCompleteScreenProps): React.JSX.Element {
  const scorePercent = Math.round((correctCount / ROUNDS_PER_SESSION) * 100)
  const isPerfectSprint = correctCount === ROUNDS_PER_SESSION

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-10 px-6 py-16 text-center">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Sprint Complete</h1>
        <p className="mt-2 text-sm text-muted-foreground">Nice photographic recall.</p>
        {isPerfectSprint && (
          <p className="mt-2 text-sm font-semibold text-emerald-600">Flawless dash! +{PERFECT_SESSION_BONUS} bonus included.</p>
        )}
      </div>

      <div className="grid w-full grid-cols-2 gap-4">
        <ReadingStatTile variant="card" label="Right Brain Photographic Score" value={`${scorePercent}%`} />
        <ReadingStatTile variant="card" label="Correct Recalls" value={`${correctCount} / ${ROUNDS_PER_SESSION}`} />
        <ReadingStatTile variant="card" label="Total Points" value={String(totalScore)} />
        <ReadingStatTile variant="card" label="Best Streak" value={String(bestStreak)} />
        <ReadingStatTile variant="card" label="Time" value={formatElapsedTime(elapsedMs)} />
        <ReadingStatTile variant="card" label="Total Rounds" value={String(ROUNDS_PER_SESSION)} />
        <ReadingStatTile variant="card" label="Best Score (All-Time)" value={`${bestScorePercentAllTime}%`} />
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
          href={backHref}
          className="rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
        >
          Back to Lab
        </Link>
      </div>
    </div>
  )
}
