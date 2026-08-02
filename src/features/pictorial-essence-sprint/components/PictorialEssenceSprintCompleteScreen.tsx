'use client'

import Link from 'next/link'
import { ReadingStatTile } from '@/features/reading-engine/components/ReadingStatTile'
import { formatElapsedTime } from '@/features/quantum-speed-reading/readingSessionEngine'
import { ROUNDS_PER_SESSION, PERFECT_SESSION_BONUS } from '../pictorialEssenceSprintDataset'

type PictorialEssenceSprintCompleteScreenProps = {
  variant: 'complete' | 'game-over'
  elapsedMs: number
  correctCount: number
  totalScore: number
  bestStreak: number
  fastestReactionMs: number | null
  bestAccuracyPercentAllTime: number
  bestStreakAllTime: number
  onPlayAgain: () => void
  backHref?: string
}

// A dedicated completion screen, not a reuse of ReadingSessionCompleteScreen
// — that component's stats (Average Reading Pace, Target WPM, Words Read)
// are hard WPM-shaped and don't describe an essence-recall arcade sprint
// honestly. Rather than fabricate a WPM/words-read number just to fit
// that shared component's prop contract, this is a small, additive
// screen matching the exact same visual language/classes as every
// sibling gamified exercise's own completion screen, without modifying
// or forking the locked component itself. Arcade Hard Mode's own
// addition: a `variant` prop swaps the headline/subtitle between a clean
// finish and a Game Over (all 3 lives lost before the sprint was done) —
// same stat grid either way, since both reflect exactly what was
// honestly accumulated before the session ended.
export function PictorialEssenceSprintCompleteScreen({
  variant,
  elapsedMs,
  correctCount,
  totalScore,
  bestStreak,
  fastestReactionMs,
  bestAccuracyPercentAllTime,
  bestStreakAllTime,
  onPlayAgain,
  backHref = '/labs/quantum-speed-reading',
}: PictorialEssenceSprintCompleteScreenProps): React.JSX.Element {
  const accuracyPercent = Math.round((correctCount / ROUNDS_PER_SESSION) * 100)
  const isPerfectSprint = variant === 'complete' && correctCount === ROUNDS_PER_SESSION
  const isGameOver = variant === 'game-over'

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-10 px-6 py-16 text-center">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">{isGameOver ? 'Game Over' : 'Sprint Complete'}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isGameOver ? 'Out of lives — here is how far you got.' : 'Nice essence recall.'}
        </p>
        {isPerfectSprint && (
          <p className="mt-2 text-sm font-semibold text-emerald-600">Flawless dash! +{PERFECT_SESSION_BONUS} bonus included.</p>
        )}
      </div>

      <div className="grid w-full grid-cols-2 gap-4">
        <ReadingStatTile variant="card" label="Essence Accuracy" value={`${accuracyPercent}%`} />
        <ReadingStatTile variant="card" label="Correct Matches" value={`${correctCount} / ${ROUNDS_PER_SESSION}`} />
        <ReadingStatTile variant="card" label="Total Points" value={String(totalScore)} />
        <ReadingStatTile variant="card" label="Best Streak" value={String(bestStreak)} />
        <ReadingStatTile
          variant="card"
          label="Fastest Reaction"
          value={fastestReactionMs === null ? '—' : `${(fastestReactionMs / 1000).toFixed(1)}s`}
        />
        <ReadingStatTile variant="card" label="Time" value={formatElapsedTime(elapsedMs)} />
        <ReadingStatTile variant="card" label="Best Accuracy (All-Time)" value={`${bestAccuracyPercentAllTime}%`} />
        <ReadingStatTile variant="card" label="Best Streak (All-Time)" value={String(bestStreakAllTime)} />
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={onPlayAgain}
          className="rounded-full bg-foreground px-8 py-3 text-sm font-medium text-background transition-all duration-150 hover:opacity-80 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {isGameOver ? 'Try Again' : 'Play Again'}
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
