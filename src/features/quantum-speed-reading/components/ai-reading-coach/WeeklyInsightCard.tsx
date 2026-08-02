import { Sparkles } from 'lucide-react'

type WeeklyInsightCardProps = {
  insight: string
}

export function WeeklyInsightCard({ insight }: WeeklyInsightCardProps): React.JSX.Element {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-primary" aria-hidden="true" />
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Weekly Insight</p>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-foreground">{insight}</p>
    </div>
  )
}
