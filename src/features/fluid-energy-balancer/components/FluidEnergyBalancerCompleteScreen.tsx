'use client'

import Link from 'next/link'
import { ReadingStatTile } from '@/features/reading-engine/components/ReadingStatTile'
import { formatElapsedTime } from '@/features/quantum-speed-reading/readingSessionEngine'
import { FLUID_ENERGY_ROUNDS_PER_SESSION } from '../fluidEnergyEngine'

type FluidEnergyBalancerCompleteScreenProps = {
  elapsedMs: number
  overallStabilityPercent: number
  streak: number
  bestScorePercentAllTime: number
  bestStreakAllTime: number
  onPlayAgain: () => void
  backHref?: string
}

// A dedicated completion screen, not a reuse of ReadingSessionCompleteScreen
// — that component's stats (Average Reading Pace, Target WPM, Words Read)
// are hard WPM-shaped and don't describe a real-time balancing simulation
// honestly. Same visual language/classes as every other advanced
// exercise's own CompleteScreen, without modifying or forking the locked
// shared component.
export function FluidEnergyBalancerCompleteScreen({
  elapsedMs,
  overallStabilityPercent,
  streak,
  bestScorePercentAllTime,
  bestStreakAllTime,
  onPlayAgain,
  backHref = '/labs/quantum-speed-reading',
}: FluidEnergyBalancerCompleteScreenProps): React.JSX.Element {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-10 px-6 py-16 text-center">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Harmony Achieved</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {FLUID_ENERGY_ROUNDS_PER_SESSION} rounds of Earth, Gold, Air &amp; Water — balanced.
        </p>
      </div>

      <div className="grid w-full grid-cols-2 gap-4">
        <ReadingStatTile variant="card" label="Overall Stability" value={`${overallStabilityPercent}%`} />
        <ReadingStatTile variant="card" label="Perfect Round Streak" value={String(streak)} />
        <ReadingStatTile variant="card" label="Balance Time" value={formatElapsedTime(elapsedMs)} />
        <ReadingStatTile variant="card" label="Best Stability (All-Time)" value={`${bestScorePercentAllTime}%`} />
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
