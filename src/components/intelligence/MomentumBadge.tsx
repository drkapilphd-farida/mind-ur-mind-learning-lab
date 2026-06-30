// MomentumBadge — compact inline chip showing streak/momentum state.
// Works for any Lab — pass the journey state, get a momentum chip.

import { Flame } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { JourneyState } from '@/types/intelligence'

type MomentumBadgeProps = {
  journey: Pick<JourneyState, 'currentStreak' | 'stage'>
  size?: 'sm' | 'md'
}

export function MomentumBadge({ journey, size = 'md' }: MomentumBadgeProps): React.JSX.Element {
  const { currentStreak, stage } = journey
  const hasStreak = currentStreak > 0
  const label = stage === 'Accelerating' ? 'Accelerating' : stage === 'Growing' ? 'Growing' : stage

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-border bg-card font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
      )}
      aria-label={`Momentum: ${label}, ${currentStreak} day streak`}
    >
      <Flame
        className={cn('shrink-0', hasStreak ? 'text-orange-500' : 'text-muted-foreground/40',
          size === 'sm' ? 'size-2.5' : 'size-3',
        )}
        aria-hidden="true"
      />
      <span className="tabular-nums text-foreground">{currentStreak}d</span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  )
}
