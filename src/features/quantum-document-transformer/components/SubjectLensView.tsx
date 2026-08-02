import { Telescope } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import type { SubjectLens } from '../types'

type SubjectLensViewProps = {
  lens: SubjectLens
}

// Subject-Specific Lens™ — the model's own real classification of the
// document's subject, plus a small set of insights whose labels it chose
// to fit that subject (e.g. "Key Formula" for a Physics document, "Central
// Theme" for a Literature one) — never a fixed template forced onto every
// subject.
export function SubjectLensView({ lens }: SubjectLensViewProps): React.JSX.Element {
  return (
    <div className="rounded-xl border border-border bg-foreground/[0.02] p-4">
      <div className="flex items-center gap-1.5">
        <Telescope className="size-3.5 text-emerald-500" aria-hidden="true" />
        <p className={TYPOGRAPHY.label}>Subject Lens™</p>
        <Badge variant="outline" className="ml-1">{lens.subject}</Badge>
      </div>
      <ul className="mt-3 space-y-3">
        {lens.insights.map((insight) => (
          <li key={insight.label}>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{insight.label}</p>
            <p className="mt-0.5 whitespace-pre-line text-sm text-foreground">{insight.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
