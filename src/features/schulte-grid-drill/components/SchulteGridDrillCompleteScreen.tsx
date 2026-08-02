'use client'

import Link from 'next/link'
import { ReadingStatTile } from '@/features/reading-engine/components/ReadingStatTile'
import { formatElapsedTime } from '@/features/quantum-speed-reading/readingSessionEngine'
import { SCHULTE_GRID_TOTAL_CELLS } from '../schulteGridDataset'

type SchulteGridDrillCompleteScreenProps = {
  elapsedMs: number
  mistakeCount: number
  bestTimeMs: number
  onPlayAgain: () => void
  backHref?: string
}

// A dedicated completion screen, not a reuse of ReadingSessionCompleteScreen
// — that component's stats (Average Reading Pace, Target WPM, Words Read)
// are hard WPM-shaped and don't describe a click-search drill honestly.
// Rather than fabricate a WPM/words-read number just to fit that shared
// component's prop contract, this is a small, additive screen matching
// the exact same visual language/classes (same card grid, same button
// styling) without modifying or forking the locked component itself.
export function SchulteGridDrillCompleteScreen({
  elapsedMs,
  mistakeCount,
  bestTimeMs,
  onPlayAgain,
  backHref = '/labs/quantum-speed-reading',
}: SchulteGridDrillCompleteScreenProps): React.JSX.Element {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-10 px-6 py-16 text-center">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Grid Complete</h1>
        <p className="mt-2 text-sm text-muted-foreground">Nice, focused search.</p>
      </div>

      <div className="grid w-full grid-cols-2 gap-4">
        <ReadingStatTile variant="card" label="Total Time" value={formatElapsedTime(elapsedMs)} />
        <ReadingStatTile variant="card" label="Best Time" value={formatElapsedTime(bestTimeMs)} />
        <ReadingStatTile variant="card" label="Mistakes" value={String(mistakeCount)} />
        <ReadingStatTile variant="card" label="Numbers Found" value={`${SCHULTE_GRID_TOTAL_CELLS} / ${SCHULTE_GRID_TOTAL_CELLS}`} />
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
