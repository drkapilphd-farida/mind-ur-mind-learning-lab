import { Brain, Clock, Gauge, Lightbulb, ListOrdered, Sparkles, TrendingDown, TrendingUp } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ICON_SIZE } from '@/lib/designSystem/icons'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import type { BlueprintInsightLevel, BlueprintInsights } from '@/types/learning/blueprint'

const LEVEL_LABEL: Record<BlueprintInsightLevel, string> = {
  building: 'Building',
  moderate: 'Moderate',
  strong: 'Strong',
}

type InsightRowProps = {
  icon: LucideIcon
  label: string
  children: React.ReactNode
}

function InsightRow({ icon: Icon, label, children }: InsightRowProps): React.JSX.Element {
  return (
    <div className="flex items-start gap-3 py-3">
      <span aria-hidden="true" className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className={ICON_SIZE.md} />
      </span>
      <div className="min-w-0 flex-1">
        <p className={TYPOGRAPHY.label}>{label}</p>
        <div className="mt-1">{children}</div>
      </div>
    </div>
  )
}

type AIInsightsPanelProps = {
  insights: BlueprintInsights
}

// Sprint 2, Chunk 3 — AI Insights Panel.
//
// Production AI Integration — every value here now comes from
// generateRealLearningBlueprint.ts, derived from the real, Claude-
// enriched Universal Learning Object™. Two rows were relabeled rather
// than left claiming something no real data can honestly back:
// "Memory Prediction" (which implied predicting *this learner's* future
// recall — nothing can know that before a real session happens) is now
// "Material Memory Difficulty," a real threshold band over UCE-5's own
// computed `memoryDifficulty` heuristic — a property of the material,
// not a claim about the learner. "Confidence Level" is now genuinely
// the AI's own real, self-reported confidence in its analysis, not a
// mock qualitative pick.
export function AIInsightsPanel({ insights }: AIInsightsPanelProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className={cn(ICON_SIZE.md, 'text-primary')} aria-hidden="true" />
          <CardTitle>AI Insights</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        <InsightRow icon={TrendingUp} label="Strong Areas">
          {insights.strongAreas.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {insights.strongAreas.map((area) => (
                <Badge key={area} variant="outline">
                  {area}
                </Badge>
              ))}
            </div>
          ) : (
            <p className={TYPOGRAPHY.caption}>Not enough concepts yet to highlight strong areas.</p>
          )}
        </InsightRow>

        <InsightRow icon={TrendingDown} label="Weak Areas">
          {insights.weakAreas.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {insights.weakAreas.map((area) => (
                <Badge key={area} variant="outline">
                  {area}
                </Badge>
              ))}
            </div>
          ) : (
            <p className={TYPOGRAPHY.caption}>Not enough concepts yet to highlight weak areas.</p>
          )}
        </InsightRow>

        <InsightRow icon={ListOrdered} label="Suggested Study Order">
          <p className={TYPOGRAPHY.body}>{insights.suggestedStudyOrder}</p>
        </InsightRow>

        <InsightRow icon={Clock} label="Estimated Completion Time">
          <p className={TYPOGRAPHY.body}>{insights.estimatedCompletionSummary}</p>
        </InsightRow>

        <InsightRow icon={Brain} label="Material Memory Difficulty">
          <Badge variant="secondary">{LEVEL_LABEL[insights.memoryPrediction]}</Badge>
        </InsightRow>

        <InsightRow icon={Gauge} label="AI Analysis Confidence">
          <Badge variant="secondary">{LEVEL_LABEL[insights.confidenceLevel]}</Badge>
        </InsightRow>

        <InsightRow icon={Lightbulb} label="Learning Recommendation">
          <p className={TYPOGRAPHY.body}>{insights.recommendation}</p>
        </InsightRow>
      </CardContent>
    </Card>
  )
}
