// EvolutionCard — generic "what should I unlock next?" card.
// Reading Lab, Memory Lab, Focus Lab all use this same component.

import Link from 'next/link'
import { ArrowRight, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { DIMENSION_LABELS } from '@/lib/intelligence/engine'
import type { EvolutionState } from '@/types/intelligence'

type EvolutionCardProps = {
  evolution: EvolutionState
  currentMindScore: number
  // Link to the current Lab's next exercise
  nextActivationHref: string | null
  nextActivationLabel: string | null
}

export function EvolutionCard({
  evolution,
  currentMindScore,
  nextActivationHref,
  nextActivationLabel,
}: EvolutionCardProps): React.JSX.Element {
  const { isReadyForEvolution, nextDimension, mindScoreRequired, progressPercent } = evolution

  const canEvolve = isReadyForEvolution && (mindScoreRequired === null || currentMindScore >= mindScoreRequired)
  const nextLabel = nextDimension ? DIMENSION_LABELS[nextDimension] : null

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Next Evolution™
      </p>

      <div className="mt-4 flex items-start gap-4">
        <div className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-full',
          canEvolve ? 'bg-primary/[0.08]' : 'bg-muted',
        )}>
          {canEvolve
            ? <ArrowRight className="size-4 text-primary" aria-hidden="true" />
            : <Lock className="size-4 text-muted-foreground" aria-hidden="true" />}
        </div>

        <div className="min-w-0 flex-1">
          {isReadyForEvolution && nextLabel !== null ? (
            <>
              <p className="text-sm font-semibold text-foreground">{nextLabel}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {mindScoreRequired !== null && currentMindScore < mindScoreRequired
                  ? `Reach Mind Score ${mindScoreRequired} to begin this evolution`
                  : 'Your foundation is ready — begin this evolution now'}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-foreground">
                Complete all activations first
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Activate every stage in this Lab, then evolve to the next Intelligence dimension.
              </p>
            </>
          )}

          {/* Progress bar toward Mind Score requirement or Lab completion */}
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
              <span>Mind Score {currentMindScore}</span>
              {mindScoreRequired !== null && <span>Goal: {mindScoreRequired}</span>}
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-foreground/[0.06]">
              <div
                className="h-1 rounded-full bg-primary transition-[width] duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
                role="progressbar"
                aria-valuenow={currentMindScore}
                aria-valuemin={0}
                aria-valuemax={mindScoreRequired ?? 1000}
                aria-label="Progress toward next evolution"
              />
            </div>
          </div>

          {/* CTA */}
          {canEvolve && nextDimension !== null ? (
            <Button asChild size="sm" className="mt-4 gap-1.5 rounded-full" variant="outline">
              <Link href="/dashboard">
                Begin Evolution
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          ) : nextActivationHref !== null && nextActivationLabel !== null ? (
            <Button asChild size="sm" className="mt-4 gap-1.5 rounded-full" variant="outline">
              <Link href={nextActivationHref}>
                Continue Activation
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
