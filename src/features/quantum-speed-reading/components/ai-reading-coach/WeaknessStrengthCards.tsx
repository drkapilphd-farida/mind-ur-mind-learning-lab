import { TrendingUp, AlertTriangle } from 'lucide-react'
import type { DetectedStrength } from '../../ai-reading-coach/strengthDetectorEngine'
import type { DetectedWeakness } from '../../ai-reading-coach/weaknessDetectorEngine'

type WeaknessStrengthCardsProps = {
  strengths: readonly DetectedStrength[]
  weaknesses: readonly DetectedWeakness[]
}

export function WeaknessStrengthCards({ strengths, weaknesses }: WeaknessStrengthCardsProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-4 text-success" aria-hidden="true" />
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Strengths</p>
        </div>
        {strengths.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Keep practicing to reveal your strengths.</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {strengths.map((strength) => (
              <span key={strength.id} className="rounded-full border border-success/30 bg-success/[0.06] px-3 py-1.5 text-xs font-medium text-success">
                {strength.label}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-4 text-warning" aria-hidden="true" />
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Focus Areas</p>
        </div>
        {weaknesses.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No recurring patterns detected — nice work.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {weaknesses.map((weakness) => (
              <div key={weakness.id}>
                <p className="text-sm font-medium text-foreground">{weakness.label}</p>
                <p className="text-xs text-muted-foreground">{weakness.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
