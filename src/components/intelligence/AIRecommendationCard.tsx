// AIRecommendationCard — renders a Recommendation object from the engine.
// Any Lab passes its computed Recommendation; this card handles all display.

import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Recommendation, RecommendationType } from '@/types/intelligence'

const TYPE_LABELS: Record<RecommendationType, string> = {
  practice: 'AI Recommendation™',
  evolve: 'Evolution Ready™',
  rest: 'Recovery Mode™',
  reflect: 'Mind Reset™',
}

type AIRecommendationCardProps = {
  recommendation: Recommendation
}

export function AIRecommendationCard({ recommendation }: AIRecommendationCardProps): React.JSX.Element {
  const { type, message, detail, actionLabel, actionHref, estimatedMinutes } = recommendation

  return (
    <div className={cn('rounded-2xl border bg-card p-6 shadow-sm')}>
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        <Sparkles className="size-3.5" aria-hidden="true" />
        {TYPE_LABELS[type]}
      </div>

      <p className="mt-3 text-base leading-relaxed text-foreground">{message}</p>

      {detail !== null && (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{detail}</p>
      )}

      {estimatedMinutes !== null && (
        <p className="mt-3 text-xs text-muted-foreground">
          Estimated time: ~{estimatedMinutes} minutes
        </p>
      )}

      {actionLabel !== null && actionHref !== null && (
        <Button asChild size="sm" className="mt-4 gap-1.5 rounded-full" variant="outline">
          <Link href={actionHref}>
            {actionLabel}
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      )}
    </div>
  )
}
