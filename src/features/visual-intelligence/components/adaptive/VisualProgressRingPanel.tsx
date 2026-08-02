'use client'

import { ProgressRing } from '@/components/exercises/ProgressRing'
import { useCountUp } from '@/hooks/exercises/useCountUp'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import type { LevelProgress } from '../../adaptive/types/adaptiveTypes'

type VisualProgressRingPanelProps = {
  levelProgress: LevelProgress
}

// Visual Progress Ring — Current Level, Current XP, Current Progress, and
// Next Level Progress, all in one panel. Composes the existing, unmodified
// ProgressRing (src/components/exercises/ProgressRing.tsx).
export function VisualProgressRingPanel({ levelProgress }: VisualProgressRingPanelProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const animatedXp = useCountUp(levelProgress.currentXp, 700, prefersReducedMotion)
  const progressPercent = Math.round(levelProgress.progress * 100)

  return (
    <div className="flex items-center gap-5 rounded-2xl border bg-card p-6 shadow-sm">
      <ProgressRing
        progress={levelProgress.progress}
        size={96}
        label={`L${levelProgress.currentLevel}`}
        accessibleLabel={`Level ${levelProgress.currentLevel}, ${progressPercent} percent toward the next level`}
      />
      <div className="flex-1 space-y-2 text-left">
        <div>
          <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Current Level</p>
          <p className="text-sm font-semibold text-foreground">{levelProgress.currentLevelName}</p>
        </div>
        <div>
          <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Current XP</p>
          <p className="text-sm font-semibold text-foreground tabular-nums">{Math.round(animatedXp)}</p>
        </div>
        <div>
          <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
            {levelProgress.nextLevelName ? `Progress to ${levelProgress.nextLevelName}` : 'Next Level Progress'}
          </p>
          <p className="text-sm font-semibold text-foreground">
            {levelProgress.nextLevelName ? `${progressPercent}%` : 'Master level reached'}
          </p>
        </div>
      </div>
    </div>
  )
}
