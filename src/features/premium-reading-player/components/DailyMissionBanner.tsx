'use client'

import { Target } from 'lucide-react'

type DailyMissionBannerProps = {
  // Caller-composed via getTodaysGoal/getMotivationalMessage
  // (src/lib/exercises/dashboardInsights.ts) — this component renders text,
  // it never generates it.
  missionText: string
}

export function DailyMissionBanner({ missionText }: DailyMissionBannerProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border bg-card px-4 py-3 text-sm">
      <Target className="size-4 shrink-0 text-primary" aria-hidden="true" />
      <p className="text-foreground">{missionText}</p>
    </div>
  )
}
