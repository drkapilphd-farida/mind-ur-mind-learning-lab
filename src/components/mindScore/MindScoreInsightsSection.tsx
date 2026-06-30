import { Sparkles } from 'lucide-react'
import { generateMindScoreInsights, type MindScoreInsightsInput } from '@/lib/ai/generateMindScoreInsights'

export async function MindScoreInsightsSection(props: MindScoreInsightsInput): Promise<React.JSX.Element> {
  const insights = await generateMindScoreInsights(props)

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        <Sparkles className="size-3.5" aria-hidden="true" />
        AI Insights™
      </div>

      <ul className="mt-4 space-y-3" role="list">
        {insights.map((insight, i) => (
          <li key={i} className="flex gap-3">
            <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-foreground">{insight}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function MindScoreInsightsSkeleton(): React.JSX.Element {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        <Sparkles className="size-3.5" aria-hidden="true" />
        AI Insights™
      </div>
      <div className="mt-4 space-y-3">
        {[0.9, 0.75, 0.85].map((w, i) => (
          <div key={i} className="flex gap-3">
            <div className="mt-2 size-1.5 shrink-0 rounded-full bg-muted" />
            <div className="h-4 animate-pulse rounded bg-muted" style={{ width: `${w * 100}%` }} />
          </div>
        ))}
      </div>
    </div>
  )
}
