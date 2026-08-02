import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import type { MemoryStrengthDistribution } from '../analytics'

type MemoryStrengthIndicatorsProps = {
  distribution: MemoryStrengthDistribution
}

const BANDS = [
  { key: 'strong' as const, label: 'Strong', variant: 'success' as const },
  { key: 'developing' as const, label: 'Developing', variant: 'secondary' as const },
  { key: 'needsReview' as const, label: 'Needs review', variant: 'warning' as const },
]

// Memory Mode™ Sprint-4 — Memory Analytics & Insights™. Memory Strength
// Indicators (item 4). A real, honest three-band distribution
// (`computeMemoryStrengthDistribution`, Sprint-4) — never a punitive red
// "wrong" framing for the lowest band; "warning" (amber) reads as
// "worth another look," not a failure, consistent with the platform's
// own Mastery Philosophy.
export function MemoryStrengthIndicators({ distribution }: MemoryStrengthIndicatorsProps): React.JSX.Element {
  const total = distribution.strong + distribution.developing + distribution.needsReview

  return (
    <Card>
      <CardHeader>
        <CardTitle>Memory Strength</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {total === 0 ? (
          <p className={TYPOGRAPHY.small}>No sessions yet — strength indicators will appear after your first one.</p>
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
