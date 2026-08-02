import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PASSAGE_CATEGORY_LABEL, PASSAGE_DIFFICULTY_LABEL } from '../../passageDifficulty'
import type { NextSessionRecommendation } from '../../ai-reading-coach/nextSessionRecommendationEngine'

type NextSessionRecommendationCardProps = {
  recommendation: NextSessionRecommendation
}

export function NextSessionRecommendationCard({ recommendation }: NextSessionRecommendationCardProps): React.JSX.Element {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Recommended Next Session</p>
      <h3 className="mt-2 text-lg font-semibold text-foreground">
        {PASSAGE_CATEGORY_LABEL[recommendation.category]} · {PASSAGE_DIFFICULTY_LABEL[recommendation.difficulty]}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">{recommendation.passage.title}</p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{recommendation.reason}</p>
      <Button asChild size="sm" className="mt-4 gap-2 rounded-full">
        <Link href={`/labs/quantum-speed-reading/start/prepare?passage=${recommendation.passage.id}`}>
          Start This Passage
          <ArrowRight className="size-3.5" />
        </Link>
      </Button>
    </div>
  )
}
