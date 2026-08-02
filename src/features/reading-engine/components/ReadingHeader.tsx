'use client'

import { useCountUp } from '@/hooks/exercises/useCountUp'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { formatElapsedTime } from '@/features/quantum-speed-reading/readingSessionEngine'
import { ReadingStatTile } from './ReadingStatTile'
import { ReadingProgressBar } from './ReadingProgressBar'

// Below this elapsed time, live WPM is computed from too few words to mean
// anything (e.g. "11" against a target of "300" reads as broken, not slow) —
// this is a presentation threshold only, the underlying computeWpm math is
// untouched.
const WARM_UP_THRESHOLD_MS = 1500

type ReadingHeaderProps = {
  modeLabel: string
  liveWpm: number
  targetWpm: number
  elapsedMs: number
  progressPercent: number
}

// Sprint 3.2A — the one shared reading header every Reading Mode inherits.
// Deliberately shows only Reading Pace / Target WPM / Elapsed live (Words
// Read is intentionally left off this live view — it still appears on
// ReadingSessionCompleteScreen — to keep the header uncluttered while
// reading is actually happening).
export function ReadingHeader({ modeLabel, liveWpm, targetWpm, elapsedMs, progressPercent }: ReadingHeaderProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const animatedWpm = useCountUp(liveWpm, 400, prefersReducedMotion)
  const isWarmingUp = elapsedMs < WARM_UP_THRESHOLD_MS

  return (
    <div className="w-full max-w-md">
      <p className="mb-3 text-center text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{modeLabel}</p>

      <div className="grid grid-cols-3 gap-x-4 text-center">
        <ReadingStatTile label="Reading Pace" value={isWarmingUp ? 'Warming up…' : `${Math.round(animatedWpm)} wpm`} />
        <ReadingStatTile label="Target WPM" value={String(targetWpm)} />
        <ReadingStatTile label="Elapsed" value={formatElapsedTime(elapsedMs)} />
      </div>

      <div className="mt-4">
        <ReadingProgressBar progressPercent={progressPercent} />
      </div>
    </div>
  )
}
