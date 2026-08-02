import { Lock, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UnlockedAchievementV2 } from '../../ai-reading-coach/achievementEngineV2'

type AchievementCardV2Props = {
  achievement: UnlockedAchievementV2
}

// Mirrors Sprint-4's AchievementCard.tsx exactly (same classes/layout) —
// a new, small component rather than reusing that one directly, since
// this sprint's achievements have a genuinely different data shape
// (no category/metric/threshold fields) and Sprint-4's component/types
// are never modified.
export function AchievementCardV2({ achievement }: AchievementCardV2Props): React.JSX.Element {
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
        {achievement.unlocked && <span className="text-xs font-medium text-success">Unlocked</span>}
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
