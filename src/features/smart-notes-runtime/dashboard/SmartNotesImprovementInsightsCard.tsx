import { Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { ICON_SIZE } from '@/lib/designSystem/icons'

type SmartNotesImprovementInsightsCardProps = {
  insights: readonly string[]
}

// Smart Notes™ Sprint-4 — Analytics & Insights™. Improvement Insights.
// Plain, honest, real sentences — no score, no grade, no AI-generated
// text. Mirrors Memory Mode™'s own `MemoryImprovementInsightsCard`
// (Sprint-4) exactly.
//
// Smart Notes™ Sprint-5 polish: each real insight staggers in
// (`slide-in-from-left-1`, 60ms/index), matching Memory's own Sprint-5
// treatment exactly.
export function SmartNotesImprovementInsightsCard({ insights }: SmartNotesImprovementInsightsCardProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Improvement Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {insights.map((insight, index) => (
            <li key={insight} className="animate-in fade-in slide-in-from-left-1 fill-mode-backwards flex items-start gap-2 duration-(--duration-base)" style={{ animationDelay: `${index * 60}ms` }}>
              <Sparkles className={`${ICON_SIZE.sm} mt-0.5 shrink-0 text-primary`} aria-hidden="true" />
              <span className={TYPOGRAPHY.small}>{insight}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
