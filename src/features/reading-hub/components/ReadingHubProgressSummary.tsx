'use client'

import { useEffect, useState } from 'react'
import { ReadingStatTile } from '@/features/reading-engine/components/ReadingStatTile'
import { loadBestWpm } from '@/features/reading-engine/readingLocalHistory'
import { formatElapsedTime } from '@/features/quantum-speed-reading/readingSessionEngine'
import { READING_HUB_MODES } from '../readingHubModes'

type ReadingHubProgressSummaryProps = {
  todaysPracticeMs: number
  sessionsCompletedToday: number
  currentStreakDays: number
}

// Sprint 3.3A — Today's Practice Time / Sessions Completed / Current
// Reading Streak are all real, computed server-side from practice_sessions
// and passed in as props. Best Reading Pace is the one genuinely
// client-only value (max across the reading modes' localStorage bests, via
// the unmodified readingLocalHistory.ts) — computed after mount, "—" before.
// Schulte Grid Speed Drill Sprint — explicitly excludes any mode whose
// statUnit is 'time-ms' (a completion time, not a reading pace) from this
// WPM aggregate. Mixing the two into one Math.max would silently corrupt
// the figure (a millisecond duration is numerically far larger than any
// real WPM value, so it would always "win" and display as a nonsensical
// pace).
export function ReadingHubProgressSummary({
  todaysPracticeMs,
  sessionsCompletedToday,
  currentStreakDays,
}: ReadingHubProgressSummaryProps): React.JSX.Element {
  const [bestWpm, setBestWpm] = useState<number | null>(null)

  useEffect(() => {
    const bests = READING_HUB_MODES.filter((mode) => mode.storageKey !== undefined && (mode.statUnit ?? 'wpm') === 'wpm').map((mode) =>
      loadBestWpm(mode.storageKey as string),
    )
    setBestWpm(bests.length > 0 ? Math.max(...bests) : 0)
  }, [])

  const bestPaceLabel = bestWpm === null ? '—' : bestWpm > 0 ? `${bestWpm} wpm` : 'No sessions yet'

  return (
    <div>
      <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">Your Progress</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ReadingStatTile variant="card" label="Today's Practice" value={formatElapsedTime(todaysPracticeMs)} />
        <ReadingStatTile variant="card" label="Sessions Today" value={String(sessionsCompletedToday)} />
        <ReadingStatTile variant="card" label="Best Reading Pace" value={bestPaceLabel} />
        <ReadingStatTile variant="card" label="Current Streak" value={`${currentStreakDays} ${currentStreakDays === 1 ? 'day' : 'days'}`} />
      </div>
    </div>
  )
}
