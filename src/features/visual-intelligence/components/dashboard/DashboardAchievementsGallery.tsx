import { Check, HelpCircle, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DashboardAchievement } from '../../dashboard/dashboardAchievements'

type DashboardAchievementsGalleryProps = {
  achievements: readonly DashboardAchievement[]
}

// Beautiful premium badge gallery — merges Sprint-7's 7 achievements +
// Sprint-8's 7 achievements (14 total), reused read-only via
// dashboardAchievements.ts. No new unlock logic.
export function DashboardAchievementsGallery({ achievements }: DashboardAchievementsGalleryProps): React.JSX.Element {
  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm">
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Achievements</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {achievements.map((achievement) => {
          const progressPercent = Math.round(achievement.progressToward * 100)
          const Icon = achievement.unlocked ? Check : achievement.trackable ? Lock : HelpCircle

          return (
            <div
              key={achievement.id}
              className={cn('rounded-2xl border p-3 text-center shadow-sm', achievement.unlocked ? 'border-success/30 bg-success/[0.04]' : 'bg-card')}
            >
              <div
                className={cn(
                  'mx-auto flex size-9 items-center justify-center rounded-full',
                  achievement.unlocked ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground',
                )}
                aria-hidden="true"
              >
                <Icon className="size-4" />
              </div>
              <p className="mt-2 text-xs font-semibold text-foreground">{achievement.title}</p>
              {achievement.unlocked ? (
                <p className="mt-1 text-[9px] font-medium tracking-widest text-success uppercase">Unlocked</p>
              ) : !achievement.trackable ? (
                <p className="mt-1 text-[9px] text-muted-foreground">Not yet trackable</p>
              ) : (
                <p className="mt-1 text-[9px] text-muted-foreground">{progressPercent}%</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
