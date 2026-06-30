import Link from 'next/link'
import { ArrowRight, Clock, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

type TodaysRecommendationCardProps = {
  exerciseTitle: string | null
  exerciseHref: string | null
  actionLabel: string
  isComplete: boolean
}

const ESTIMATED_MINUTES = 4

// Today's highest-impact recommendation is always the next exercise in the
// student's actual sequence — the real "highest impact" action, not a
// fabricated suggestion.
export function TodaysRecommendationCard({
  exerciseTitle,
  exerciseHref,
  actionLabel,
  isComplete,
}: TodaysRecommendationCardProps): React.JSX.Element {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        <Sparkles className="size-3.5" aria-hidden="true" />
        Today&apos;s Recommendation™
      </div>

      {isComplete ? (
        <div className="mt-4">
          <p className="text-base font-semibold text-foreground">Eye Foundation Module Complete</p>
          <p className="mt-1 text-sm text-muted-foreground">
            You have completed every exercise. Review any exercise to maintain your Reading Intelligence score.
          </p>
        </div>
      ) : exerciseTitle !== null ? (
        <>
          <div className="mt-4">
            <p className="text-xs text-muted-foreground">Highest impact practice</p>
            <p className="mt-1 text-xl font-bold tracking-tight text-foreground">{exerciseTitle}</p>
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden="true" />
              ~{ESTIMATED_MINUTES} minutes
            </span>
            <span className="text-success font-medium">+Reading Intelligence</span>
          </div>

          {exerciseHref !== null && (
            <Button asChild size="lg" className="mt-5 w-full gap-2 rounded-full">
              <Link href={exerciseHref}>
                {actionLabel}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          )}
        </>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          Complete your first session to receive a personalised recommendation.
        </p>
      )}
    </div>
  )
}
