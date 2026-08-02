import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import type { SmartNotesEngagementDistribution } from '../analytics'

type SmartNotesEngagementIndicatorsProps = {
  distribution: SmartNotesEngagementDistribution
}

const BANDS = [
  { key: 'strong' as const, label: 'Strong', variant: 'success' as const },
  { key: 'developing' as const, label: 'Developing', variant: 'secondary' as const },
  { key: 'needsReview' as const, label: 'Needs review', variant: 'warning' as const },
]

// Smart Notes™ Sprint-4 — Analytics & Insights™. Engagement Indicators. A
// real, honest three-band distribution — never a punitive red "wrong"
// framing for the lowest band. Mirrors Memory Mode™'s own
// `MemoryStrengthIndicators` (Sprint-4) exactly.
export function SmartNotesEngagementIndicators({ distribution }: SmartNotesEngagementIndicatorsProps): React.JSX.Element {
  const total = distribution.strong + distribution.developing + distribution.needsReview

  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {total === 0 ? (
          <p className={TYPOGRAPHY.small}>No sessions yet — engagement indicators will appear after your first one.</p>
        ) : (
          BANDS.map((band) => {
            const count = distribution[band.key]
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0
            return (
              <div key={band.key} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Badge variant={band.variant}>{band.label}</Badge>
                  <span className={TYPOGRAPHY.small}>{count}</span>
                </div>
                <div className="h-1.5 max-w-40 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-foreground/70 transition-[width] duration-(--duration-slow)" style={{ width: `${percentage}%` }} />
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
