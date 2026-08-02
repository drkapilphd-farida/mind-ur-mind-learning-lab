import { Lock, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UnlockedAchievement } from '../../adaptive-intelligence/readingIntelligenceTypes'

type AchievementCardProps = {
  achievement: UnlockedAchievement
}

export function AchievementCard({ achievement }: AchievementCardProps): React.JSX.Element {
  const percent = Math.round(achievement.progressToward * 100)

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl border p-5 shadow-sm transition-all duration-300',
        achievement.unlocked ? 'border-success/30 bg-success/[0.04]' : 'border-border bg-card opacity-80',
      )}
    >
      <div className="flex items-start justify-between">
        <span
          className={cn(
            'flex size-10 items-center justify-center rounded-full',
            achievement.unlocked ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground',
          )}
          aria-hidden="true"
        >
          {achievement.unlocked ? <Check className="size-5" /> : <Lock className="size-4" />}
        </span>
        {achievement.unlocked && <span className="text-xs font-medium text-success">Achieved</span>}
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{achievement.title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{achievement.description}</p>
      </div>
      {!achievement.unlocked && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-foreground/10">
          <div className="h-full rounded-full bg-primary/50 transition-[width] duration-500" style={{ width: `${percent}%` }} />
        </div>
      )}
    </div>
  )
}
