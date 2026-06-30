'use client'

// ActivationCard — generic "dimension activated" celebration.
// Replaces per-Lab activation cards (ReadingIntelligenceActivatedCard, etc.)
// Memory Lab, Focus Lab, etc. all use this single component.

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { DIMENSION_LABELS, DIMENSION_SHORT_LABELS } from '@/lib/intelligence/engine'
import type { IntelligenceDimensionType, EvolutionState } from '@/types/intelligence'

type ActivationCardProps = {
  dimension: IntelligenceDimensionType
  activatedCount: number
  mindScore: number
  evolution: EvolutionState
  labHref: string
}

export function ActivationCard({
  dimension,
  activatedCount,
  mindScore,
  evolution,
  labHref,
}: ActivationCardProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const label = DIMENSION_LABELS[dimension]
  const nextLabel = evolution.nextDimension ? DIMENSION_SHORT_LABELS[evolution.nextDimension] : null

  return (
    <div className="rounded-2xl border bg-card p-10 text-center shadow-sm">
      {/* Apple Achievement-style mark */}
      <div className="flex justify-center">
        <div
          className={cn(
            'relative flex size-20 items-center justify-center rounded-full bg-primary/[0.07]',
            !prefersReducedMotion && 'animate-in zoom-in-75 duration-500',
          )}
          aria-hidden="true"
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/[0.12]">
            <div className="size-6 rounded-full bg-primary" />
          </div>
        </div>
      </div>

      {/* Title */}
      <h2
        className={cn(
          'mt-6 text-2xl font-bold tracking-tight text-foreground',
          !prefersReducedMotion && 'animate-in fade-in slide-in-from-bottom-2 duration-500',
        )}
        style={!prefersReducedMotion ? { animationDelay: '150ms', animationFillMode: 'backwards' } : undefined}
      >
        {label} Activated™
      </h2>

      <p
        className={cn(
          'mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground',
          !prefersReducedMotion && 'animate-in fade-in duration-500',
        )}
        style={!prefersReducedMotion ? { animationDelay: '250ms', animationFillMode: 'backwards' } : undefined}
      >
        You successfully activated all {activatedCount} stages of this Intelligence Journey.
        Your {DIMENSION_SHORT_LABELS[dimension].toLowerCase()} intelligence is permanently strengthened.
      </p>

      {/* Stats */}
      <div
        className={cn(
          'mx-auto mt-6 grid max-w-xs grid-cols-2 gap-3',
          !prefersReducedMotion && 'animate-in fade-in duration-500',
        )}
        style={!prefersReducedMotion ? { animationDelay: '350ms', animationFillMode: 'backwards' } : undefined}
      >
        <div className="rounded-xl bg-muted/40 px-4 py-3">
          <p className="text-2xl font-bold tabular-nums text-foreground">{activatedCount}</p>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Activations</p>
        </div>
        <div className="rounded-xl bg-muted/40 px-4 py-3">
          <p className="text-2xl font-bold tabular-nums text-foreground">{mindScore}</p>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Mind Score</p>
        </div>
      </div>

      {/* AI recommendation */}
      {nextLabel !== null && (
        <p
          className={cn(
            'mt-6 text-xs text-muted-foreground',
            !prefersReducedMotion && 'animate-in fade-in duration-500',
          )}
          style={!prefersReducedMotion ? { animationDelay: '450ms', animationFillMode: 'backwards' } : undefined}
        >
          AI Recommendation: Begin your {nextLabel} Intelligence Journey next.
        </p>
      )}

      {/* CTA */}
      <div
        className={cn(
          'mt-6 flex flex-col items-center gap-3',
          !prefersReducedMotion && 'animate-in fade-in duration-500',
        )}
        style={!prefersReducedMotion ? { animationDelay: '550ms', animationFillMode: 'backwards' } : undefined}
      >
        <p className="text-sm font-semibold text-foreground">Your Mind Is Ready™</p>
        <Button asChild size="lg" className="gap-2 rounded-full" variant="outline">
          <Link href="/dashboard">
            Explore Next Evolution
            <ArrowRight className="size-4" />
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href={labHref}>Practice Again</Link>
        </Button>
      </div>
    </div>
  )
}
