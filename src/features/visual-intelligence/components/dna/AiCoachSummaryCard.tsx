import { Sparkles } from 'lucide-react'

type AiCoachSummaryCardProps = {
  summary: string
}

export function AiCoachSummaryCard({ summary }: AiCoachSummaryCardProps): React.JSX.Element {
  return (
    <div className="rounded-3xl border bg-card p-6 text-left shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
        <Sparkles className="size-3.5" aria-hidden="true" />
        AI Coach Summary™
      </div>
      <p className="mt-3 text-sm leading-relaxed text-foreground">{summary}</p>
    </div>
  )
}
