import { CalendarRange } from 'lucide-react'

type MonthlyInsightCardProps = {
  insight: string
}

// Sprint-6 — mirrors WeeklyInsightCard.tsx exactly (a new, small component
// rather than adding a label prop to that Sprint-5 file, same reasoning
// Sprint-5 itself used for AchievementCardV2 vs AchievementCard).
export function MonthlyInsightCard({ insight }: MonthlyInsightCardProps): React.JSX.Element {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <CalendarRange className="size-4 text-primary" aria-hidden="true" />
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Monthly Insight</p>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-foreground">{insight}</p>
    </div>
  )
}
