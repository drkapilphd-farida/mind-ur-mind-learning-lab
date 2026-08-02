import { Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { ICON_SIZE } from '@/lib/designSystem/icons'

type MemoryImprovementInsightsCardProps = {
  insights: readonly string[]
}

// Memory Mode™ Sprint-4 — Memory Analytics & Insights™. Memory
// Improvement Insights (item 7). Plain, honest, real sentences
// (`computeMemoryImprovementInsights`) — no score, no grade, no
// AI-generated text.
export function MemoryImprovementInsightsCard({ insights }: MemoryImprovementInsightsCardProps): React.JSX.Element {
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
