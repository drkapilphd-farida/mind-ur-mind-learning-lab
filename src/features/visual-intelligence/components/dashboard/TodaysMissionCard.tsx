import Link from 'next/link'
import { ArrowRight, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { DashboardMission } from '../../dashboard/todaysMissionEngine'

function formatSeconds(totalSeconds: number): string {
  const minutes = Math.round(totalSeconds / 60)
  return `${minutes} Minute${minutes === 1 ? '' : 's'}`
}

type TodaysMissionCardProps = {
  mission: DashboardMission
}

export function TodaysMissionCard({ mission }: TodaysMissionCardProps): React.JSX.Element {
  return (
    <div className="rounded-3xl border bg-card p-7 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
        <Target className="size-3.5" aria-hidden="true" />
        Today&apos;s Mission™
      </div>

      <p className="mt-3 font-heading text-2xl font-bold tracking-tight text-foreground">{mission.exerciseLabel}</p>

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-xs sm:grid-cols-4">
        <div>
          <dt className="text-muted-foreground">Estimated Time</dt>
          <dd className="mt-0.5 font-semibold text-foreground">{formatSeconds(mission.estimatedTimeSeconds)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Estimated XP</dt>
          <dd className="mt-0.5 font-semibold text-foreground">+{mission.estimatedXp} XP</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Estimated Brain Gain</dt>
          <dd className="mt-0.5 font-semibold text-foreground">+{mission.estimatedBrainGain} pts</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Focus Area</dt>
          <dd className="mt-0.5 font-semibold text-foreground">{mission.estimatedBenefits[0]?.metricLabel ?? 'General'}</dd>
        </div>
      </dl>

      <Button asChild size="lg" className="mt-6 w-full gap-2 rounded-full">
        <Link href={mission.exerciseHref}>
          Start Training
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  )
}
