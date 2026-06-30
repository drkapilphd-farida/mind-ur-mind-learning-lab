'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

type ReadingIntelligenceActivatedCardProps = {
  completedCount: number
  totalCount: number
  mindScore: number
}

// Apple Achievement-style activation celebration — shown when every exercise
// in the Eye Foundation Module is complete. No confetti; a single calm pulse
// then a settled state that communicates accomplishment without celebration noise.
export function ReadingIntelligenceActivatedCard({
  completedCount,
  totalCount,
  mindScore,
}: ReadingIntelligenceActivatedCardProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <div className="rounded-2xl border bg-card p-10 text-center shadow-sm">
      {/* Achievement mark */}
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
          !prefersReducedMotion && 'animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150 fill-mode-backwards',
        )}
        style={!prefersReducedMotion ? { animationFillMode: 'backwards' } : undefined}
      >
        Reading Intelligence Activated™
      </h2>

      <p
        className={cn(
          'mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground',
          !prefersReducedMotion && 'animate-in fade-in duration-500 delay-200 fill-mode-backwards',
        )}
        style={!prefersReducedMotion ? { animationFillMode: 'backwards' } : undefined}
      >
        You successfully activated all {totalCount} stages of this Intelligence Journey.
        Your visual processing and reading foundation are permanently strengthened.
      </p>

      {/* Stats */}
      <div
        className={cn(
          'mx-auto mt-6 grid max-w-xs grid-cols-2 gap-3',
          !prefersReducedMotion && 'animate-in fade-in duration-500 delay-300 fill-mode-backwards',
        )}
        style={!prefersReducedMotion ? { animationFillMode: 'backwards' } : undefined}
      >
        <div className="rounded-xl bg-muted/40 px-4 py-3">
          <p className="text-2xl font-bold tabular-nums text-foreground">{completedCount}</p>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Activations</p>
        </div>
        <div className="rounded-xl bg-muted/40 px-4 py-3">
          <p className="text-2xl font-bold tabular-nums text-foreground">{mindScore}</p>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Mind Score</p>
        </div>
      </div>

      {/* AI Recommendation */}
      <p
        className={cn(
          'mt-6 text-xs text-muted-foreground',
          !prefersReducedMotion && 'animate-in fade-in duration-500 delay-400 fill-mode-backwards',
        )}
        style={!prefersReducedMotion ? { animationFillMode: 'backwards' } : undefined}
      >
        AI Recommendation: Begin your Memory Intelligence Journey next.
      </p>

      {/* CTA */}
      <div
        className={cn(
          'mt-6 flex flex-col items-center gap-3',
          !prefersReducedMotion && 'animate-in fade-in duration-500 delay-500 fill-mode-backwards',
        )}
        style={!prefersReducedMotion ? { animationFillMode: 'backwards' } : undefined}
      >
        <p className="text-sm font-semibold text-foreground">Your Mind Is Ready™</p>
        <Button asChild size="lg" className="gap-2 rounded-full" variant="outline">
          <Link href="/dashboard">
            Explore Next Evolution
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
