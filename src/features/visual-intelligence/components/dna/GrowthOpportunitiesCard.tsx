import { TrendingUp } from 'lucide-react'
import type { GrowthOpportunity } from '../../dna/dnaTypes'

type GrowthOpportunitiesCardProps = {
  opportunities: readonly GrowthOpportunity[]
}

export function GrowthOpportunitiesCard({ opportunities }: GrowthOpportunitiesCardProps): React.JSX.Element {
  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
        <TrendingUp className="size-3.5" aria-hidden="true" />
        Growth Opportunities™
      </div>

      {opportunities.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">More training required to identify growth opportunities.</p>
      ) : (
        <ol className="mt-4 space-y-3">
          {opportunities.map((opportunity, index) => (
            <li key={opportunity.categoryId} className="flex items-center gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/[0.08] text-xs font-semibold text-primary">
                {index + 1}
              </span>
              <span className="text-sm font-medium text-foreground">{opportunity.label}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
