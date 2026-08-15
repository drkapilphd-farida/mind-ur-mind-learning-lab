import { TrendingUp, AlertCircle, Zap, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StrengthSummary } from '@/lib/exercises/mindScore'

type StrengthAreasCardProps = StrengthSummary

type StrengthItem = {
  icon: typeof TrendingUp
  title: string
  value: string | null
  empty: string
  color: string
}

// Shows what the real data can support. When only one Lab is active the
// "Needs Improvement" slot remains empty rather than fabricate a comparison.
export function StrengthAreasCard({
  greatestStrength,
  needsImprovement,
  fastestGrowing,
  mostConsistent,
}: StrengthAreasCardProps): React.JSX.Element {
  const items: StrengthItem[] = [
    {
      icon: TrendingUp,
      title: 'Greatest Strength',
      value: greatestStrength,
      empty: 'Complete your first session',
      color: 'text-foreground',
    },
    {
      icon: AlertCircle,
      title: 'Needs Improvement',
      value: needsImprovement,
      empty: 'Unlock more Labs to compare',
      color: 'text-muted-foreground',
    },
    {
      icon: Zap,
      title: 'Fastest Growing',
      value: fastestGrowing,
      empty: 'Keep practising to see trends',
      color: 'text-foreground',
    },
    {
      icon: Target,
      title: 'Most Consistent',
      value: mostConsistent,
      empty: '3-day streak unlocks this',
      color: 'text-foreground',
    },
  ]

  return (
    <div className="glass-premium-card p-6">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Strength Areas™
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {items.map((item) => {
          const Icon = item.icon
          const hasValue = item.value !== null
          return (
            <div
              key={item.title}
              className={cn(
                'rounded-xl p-4',
                hasValue ? 'bg-foreground/[0.03] ring-1 ring-border' : 'bg-muted/20',
              )}
            >
              <Icon className={cn('size-4', hasValue ? 'text-foreground' : 'text-muted-foreground/50')} aria-hidden="true" />
              <p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {item.title}
              </p>
              <p className={cn(
                'mt-1 text-sm',
                hasValue ? 'font-semibold ' + item.color : 'text-muted-foreground/60',
              )}>
                {item.value ?? item.empty}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
