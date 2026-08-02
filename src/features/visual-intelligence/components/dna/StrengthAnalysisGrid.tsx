import { cn } from '@/lib/utils'
import type { StrengthCategory, StrengthTier } from '../../dna/dnaTypes'

const TIER_LABEL: Record<StrengthTier, string> = {
  excellent: 'Excellent',
  good: 'Good',
  developing: 'Developing',
  'needs-practice': 'Needs Practice',
  'more-training-required': 'More training required',
}

const TIER_CLASS: Record<StrengthTier, string> = {
  excellent: 'border-success/30 bg-success/[0.05] text-success',
  good: 'border-primary/30 bg-primary/[0.05] text-primary',
  developing: 'border-border bg-card text-foreground',
  'needs-practice': 'border-border bg-card text-muted-foreground',
  'more-training-required': 'border-border bg-muted/40 text-muted-foreground',
}

type StrengthAnalysisGridProps = {
  strengths: readonly StrengthCategory[]
}

export function StrengthAnalysisGrid({ strengths }: StrengthAnalysisGridProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {strengths.map((strength) => (
        <div key={strength.id} className={cn('rounded-2xl border p-4 shadow-sm', TIER_CLASS[strength.tier])}>
          <p className="text-sm font-semibold text-foreground">{strength.label}</p>
          <p className="mt-1 text-xs font-medium tracking-wide uppercase">{TIER_LABEL[strength.tier]}</p>
          {strength.score !== null ? (
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted" role="presentation">
              <div className="h-full rounded-full bg-current opacity-70" style={{ width: `${strength.score}%` }} />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )
}
