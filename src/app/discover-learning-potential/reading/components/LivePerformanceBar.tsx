'use client'

import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import { READING_SPRINT_LABEL, READING_SPRINT_ORDER, type ReadingSprintId } from '@/features/reading-discovery/readingSprints'
import { SprintProgressDots } from './SprintProgressDots'

type LivePerformanceBarProps = {
  sprint: ReadingSprintId
  // Real, computed by `useContinuousSprintRuntime` from real words shown
  // and real elapsed time — `null` means not enough real data exists yet
  // to compute one honestly. "Never display fake WPM... if real
  // calculation is unavailable, display 'Calculating...' instead." —
  // this component never invents a number.
  wpm: number | null
  combo: number
  xp: number
}

// Reading Runtime Engine™ (Sprint-2 Part-2) — the Live Performance Bar,
// evolved (not rebuilt) from Part-1's version: it now receives the real
// `wpm`/`combo` the continuous runtime hook already computed, rather
// than deriving a single-scene WPM internally — Part-1's version only
// ever saw one scene at a time, this one spans a whole real multi-item
// Sprint. "Display only Current WPM, Challenge Name, XP, Combo, Minimal
// Progress. Nothing else."
export function LivePerformanceBar({ sprint, wpm, combo, xp }: LivePerformanceBarProps): React.JSX.Element {
  const currentIndex = READING_SPRINT_ORDER.indexOf(sprint)

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 rounded-full border border-border/50 bg-card/60 px-4 py-2">
      <p className={cn(TYPOGRAPHY.caption, 'font-semibold whitespace-nowrap text-foreground')}>{READING_SPRINT_LABEL[sprint]}</p>
      <p className={cn(TYPOGRAPHY.caption, 'tabular-nums whitespace-nowrap text-muted-foreground')}>{wpm !== null ? `${wpm} WPM` : 'Calculating…'}</p>
      <SprintProgressDots total={READING_SPRINT_ORDER.length} currentIndex={currentIndex} />
      {combo >= 2 && <p className={cn(TYPOGRAPHY.caption, 'font-medium whitespace-nowrap text-primary')}>Combo x{combo}</p>}
      <p className={cn(TYPOGRAPHY.caption, 'font-medium whitespace-nowrap text-success')}>XP +{xp}</p>
    </div>
  )
}
