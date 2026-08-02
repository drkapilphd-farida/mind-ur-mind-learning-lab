import { Check, HelpCircle, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DnaAchievement } from '../../dna/dnaTypes'

type DnaAchievementsGridProps = {
  achievements: readonly DnaAchievement[]
}

export function DnaAchievementsGrid({ achievements }: DnaAchievementsGridProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {achievements.map((achievement) => {
        const progressPercent = Math.round(achievement.progressToward * 100)
        const Icon = achievement.unlocked ? Check : achievement.trackable ? Lock : HelpCircle

        return (
          <div
            key={achievement.id}
            className={cn('rounded-2xl border p-4 shadow-sm', achievement.unlocked ? 'border-success/30 bg-success/[0.04]' : 'bg-card')}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-full',
                  achievement.unlocked ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground',
                )}
                aria-hidden="true"
              >
                <Icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{achievement.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{achievement.description}</p>
              </div>
            </div>

            {achievement.unlocked ? (
              <p className="mt-3 text-[10px] font-medium tracking-widest text-success uppercase">Unlocked</p>
            ) : !achievement.trackable ? (
              <p className="mt-3 text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Not yet trackable</p>
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
      })}
    </div>
  )
}
