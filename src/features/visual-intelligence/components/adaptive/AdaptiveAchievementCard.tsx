import { Check, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UnlockedAchievement } from '../../adaptive/types/adaptiveTypes'

type AdaptiveAchievementCardProps = {
  achievement: UnlockedAchievement
}

// A local, decoupled sibling of quantum-speed-reading's AchievementCard.tsx
// (same visual pattern — icon badge, title, description, progress bar when
// locked, "Unlocked" label when true — not imported, since this lab stays
// decoupled from quantum-speed-reading's own feature folder and type).
export function AdaptiveAchievementCard({ achievement }: AdaptiveAchievementCardProps): React.JSX.Element {
  const progressPercent = Math.round(achievement.progressToward * 100)

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 shadow-sm',
        achievement.unlocked ? 'border-success/30 bg-success/[0.04]' : 'bg-card',
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-full',
            achievement.unlocked ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground',
          )}
          aria-hidden="true"
        >
          {achievement.unlocked ? <Check className="size-4" /> : <Lock className="size-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{achievement.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{achievement.description}</p>
        </div>
      </div>

      {achievement.unlocked ? (
        <p className="mt-3 text-[10px] font-medium tracking-widest text-success uppercase">Unlocked</p>
      ) : (
        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted" role="presentation">
            <div className="h-full rounded-full bg-primary" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">{progressPercent}%</p>
        </div>
      )}
    </div>
  )
}
