import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ReadingNextRecommendation } from '../types'

type NextRecommendationCardProps = {
  recommendation: ReadingNextRecommendation
}

// New — "Next Recommended Exercise" (§ brief), as a standalone card. The
// underlying recommendation is Sprint 48's already-computed
// nextRecommendationLabel/Href — this component only presents it; no
// recommendation logic lives here.
export function NextRecommendationCard({ recommendation }: NextRecommendationCardProps): React.JSX.Element {
  return (
    <div className="rounded-2xl border bg-card p-5 sm:p-6">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        <Sparkles className="size-3.5" aria-hidden="true" />
        Up Next
      </div>
      <p className="mt-2 text-sm text-muted-foreground">After {recommendation.stageTitle}</p>
      <Button asChild size="lg" variant="outline" className="mt-4 w-full gap-2 rounded-full sm:w-auto">
        <Link href={recommendation.href}>
          {recommendation.label}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  )
}
