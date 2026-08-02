'use client'

import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import { resolveSpeedLadderLevel, SPEED_LADDER_RUNGS } from '../presentation/resolveSpeedLadderLevel'
import type { ReadingSpeedSample } from '../actions/getReadingSpeedHistory'

type SpeedLadderViewProps = {
  samples: readonly ReadingSpeedSample[]
}

// Quantum Speed Reading Experience Engine™ (QSR-E1) — Speed Ladder™,
// deliberately built as a pure, self-contained presentational component
// from the start (real samples in, a real visual ladder out) — no
// coupling to the Reading Workspace's own session/chunk state — so it's
// genuinely reusable later inside Discover Your Learning Potential™,
// Dashboard, and Mind Score™, per the brief's own forward-looking note.
// Every number here is real: `samples` is this learner's own real,
// persisted `qsr_reading_speed_samples` history for this document — an
// empty list is shown honestly as "no real reading speed yet," never a
// guessed starting number.
export function SpeedLadderView({ samples }: SpeedLadderViewProps): React.JSX.Element {
  // Quantum Speed Reading Hub Experience™ (Sprint-1) — samples now also
  // include non-WPM completions (Presence/Guided Eye Flow/Comprehension
  // Check log `wpm: null`); the ladder is only ever about real WPM
  // numbers, so those are filtered out here rather than in every caller.
  const wpmSamples = samples.filter((sample): sample is ReadingSpeedSample & { wpm: number } => sample.wpm !== null)

  if (wpmSamples.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className={TYPOGRAPHY.h4}>No reading speed recorded yet</p>
        <p className={cn(TYPOGRAPHY.small, 'mt-2 text-muted-foreground')}>Try a Reading Sprint to record your first real reading speed.</p>
      </div>
    )
  }

  const currentWpm = wpmSamples[0]?.wpm ?? 0
  const bestWpm = Math.max(...wpmSamples.map((sample) => sample.wpm))
  const { level, nextRung } = resolveSpeedLadderLevel(currentWpm)
  const improvement = wpmSamples.length > 1 ? currentWpm - (wpmSamples[wpmSamples.length - 1]?.wpm ?? currentWpm) : 0

  return (
    <div className="space-y-6 rounded-xl border border-border bg-card p-6 sm:p-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <p className={TYPOGRAPHY.caption}>Current Speed</p>
          <p className={cn(TYPOGRAPHY.h3, 'tabular-nums')}>{currentWpm} WPM</p>
        </div>
        <div>
          <p className={TYPOGRAPHY.caption}>Best Speed</p>
          <p className={cn(TYPOGRAPHY.h3, 'tabular-nums')}>{bestWpm} WPM</p>
        </div>
        <div>
          <p className={TYPOGRAPHY.caption}>Level</p>
          <p className={cn(TYPOGRAPHY.h3, 'tabular-nums')}>{level}</p>
        </div>
        <div>
          <p className={TYPOGRAPHY.caption}>Improvement</p>
          <p className={cn(TYPOGRAPHY.h3, 'tabular-nums', improvement >= 0 ? 'text-success' : 'text-muted-foreground')}>
            {improvement >= 0 ? '+' : ''}
            {improvement} WPM
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <p className={TYPOGRAPHY.caption}>Target: {nextRung ?? SPEED_LADDER_RUNGS[SPEED_LADDER_RUNGS.length - 1]} WPM</p>
        </div>
        <div className="flex gap-1">
          {SPEED_LADDER_RUNGS.map((rung) => (
            <div key={rung} className={cn('h-2 flex-1 rounded-full', currentWpm >= rung ? 'bg-primary' : 'bg-muted')} />
          ))}
        </div>
        <div className="flex justify-between">
          {SPEED_LADDER_RUNGS.map((rung) => (
            <p key={rung} className={cn(TYPOGRAPHY.caption, 'flex-1 text-center')}>
              {rung}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
