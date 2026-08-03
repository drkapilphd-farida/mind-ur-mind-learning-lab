import { Star, Flame, BookOpen, Zap, Trophy, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

type Achievement = {
  id: string
  icon: LucideIcon
  label: string
  description: string
  achieved: boolean
}

type AchievementsCardProps = {
  completedCount: number
  totalCount: number
  currentStreak: number
  bestStreak: number
  totalCompletedSessions: number
}

// All achievements are computed from real practice data — never awarded for
// fabricated activity. Locked achievements show what the student is working
// toward, which is itself motivating.
function buildAchievements({
  completedCount,
  totalCount,
  currentStreak,
  bestStreak,
  totalCompletedSessions,
}: AchievementsCardProps): Achievement[] {
  return [
    {
      id: 'first-step',
      icon: Star,
      label: 'First Step',
      description: 'Completed your first Mind Session',
      achieved: completedCount >= 1,
    },
    {
      id: 'reading-explorer',
      icon: BookOpen,
      label: 'Reading Explorer',
      description: 'Completed 3 Reading exercises',
      achieved: completedCount >= 3,
    },
    {
      id: 'mind-builder',
      icon: Zap,
      label: 'Mind Builder',
      description: 'Completed 5 practice sessions',
      achieved: totalCompletedSessions >= 5,
    },
    {
      id: 'consistent',
      icon: Flame,
      label: '3-Day Momentum',
      description: 'Practiced 3 days in a row',
      achieved: Math.max(currentStreak, bestStreak) >= 3,
    },
    {
      id: 'momentum-7',
      icon: Trophy,
      label: '7-Day Momentum',
      description: 'Practiced 7 days in a row',
      achieved: Math.max(currentStreak, bestStreak) >= 7,
    },
    {
      id: 'module-complete',
      icon: CheckCircle2,
      label: 'Reading Master',
      description: 'Completed the Eye Foundation Module',
      achieved: completedCount >= totalCount && totalCount > 0,
    },
  ]
}

export function AchievementsCard(props: AchievementsCardProps): React.JSX.Element {
  const achievements = buildAchievements(props)
  const achievedCount = achievements.filter((a) => a.achieved).length

  return (
    <div className="glass-premium-card glass-premium-lift p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Achievements™
        </p>
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{achievedCount}</span>
          /{achievements.length}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {achievements.map((achievement) => {
          const Icon = achievement.icon
          return (
            <div
              key={achievement.id}
              className={cn(
                'flex items-start gap-3 rounded-xl p-3.5 transition-colors',
                achievement.achieved
                  ? 'bg-foreground/[0.04] ring-1 ring-border'
                  : 'bg-muted/20 opacity-50',
              )}
              aria-label={`${achievement.label}: ${achievement.achieved ? 'achieved' : 'locked'}`}
            >
              <Icon
                className={cn('mt-0.5 size-4 shrink-0', achievement.achieved ? 'text-foreground' : 'text-muted-foreground')}
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className={cn('text-xs font-semibold truncate', achievement.achieved ? 'text-foreground' : 'text-muted-foreground')}>
                  {achievement.label}
                </p>
                <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground line-clamp-2">
                  {achievement.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
