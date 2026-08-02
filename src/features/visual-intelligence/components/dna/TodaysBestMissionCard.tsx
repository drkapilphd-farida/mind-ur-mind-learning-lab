import Link from 'next/link'
import { ArrowRight, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { TodaysBestMission } from '../../dna/dnaTypes'

function formatSeconds(totalSeconds: number): string {
  const minutes = Math.round(totalSeconds / 60)
  return `${minutes} Minute${minutes === 1 ? '' : 's'}`
}

type TodaysBestMissionCardProps = {
  mission: TodaysBestMission
}

export function TodaysBestMissionCard({ mission }: TodaysBestMissionCardProps): React.JSX.Element {
  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
        <Target className="size-3.5" aria-hidden="true" />
        Today&apos;s Best Mission™
      </div>

      <p className="mt-3 font-heading text-xl font-bold tracking-tight text-foreground">{mission.exerciseLabel}</p>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-3">
        {mission.estimatedBenefits.map((benefit) => (
          <div key={benefit.metricLabel}>
            <dt className="text-muted-foreground">Estimated Benefit</dt>
            <dd className="mt-0.5 font-semibold text-foreground">
              {benefit.delta > 0 ? '+' : ''}
              {benefit.delta} {benefit.metricLabel}
            </dd>
          </div>
        ))}
        <div>
          <dt className="text-muted-foreground">Estimated Time</dt>
          <dd className="mt-0.5 font-semibold text-foreground">{formatSeconds(mission.estimatedTimeSeconds)}</dd>
        </div>
      </dl>

      <Button asChild size="lg" className="mt-5 w-full gap-2 rounded-full">
        <Link href={mission.exerciseHref}>
          Start Training
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  )
}
