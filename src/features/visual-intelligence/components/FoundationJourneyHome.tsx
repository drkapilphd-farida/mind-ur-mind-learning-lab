'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { FOUNDATION_JOURNEY_STAGES } from '../foundationStages'
import { FoundationStagePreviewCard } from './FoundationStagePreviewCard'
import { FoundationProgressIndicator } from './FoundationProgressIndicator'

// Home screen for the Foundation Journey™ — a self-contained header block
// (not an import from quantum-speed-reading's shell components) so this
// lab stays fully decoupled from Quantum Speed Reading's own feature folder.
export function FoundationJourneyHome(): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const fadeClass = !prefersReducedMotion ? 'animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-backwards' : ''
  const fadeStyle = (delayMs: number): React.CSSProperties | undefined =>
    !prefersReducedMotion ? { animationDelay: `${delayMs}ms`, animationFillMode: 'backwards' } : undefined

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href="/labs/quantum-speed-reading"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Back to Reading Intelligence Lab™
      </Link>

      <div className={cn('mt-10 text-center', fadeClass)} style={fadeStyle(0)}>
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Visual Intelligence Lab™</p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Foundation Journey™</h1>
        <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-foreground/80">
          Build the visual foundation required for extraordinary reading performance.
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Train your visual attention, eye stability, peripheral awareness and reading readiness before entering the Reading Intelligence Lab™.
        </p>
        <span className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-foreground/10 px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
          <Clock className="size-3.5" aria-hidden="true" />
          Estimated Duration: 7-8 Minutes
        </span>
      </div>

      <div className={cn('mt-10', fadeClass)} style={fadeStyle(100)}>
        <FoundationProgressIndicator currentOrder={null} />
      </div>

      <div className={cn('mt-8 space-y-4', fadeClass)} style={fadeStyle(150)}>
        {FOUNDATION_JOURNEY_STAGES.map((stage) => (
          <FoundationStagePreviewCard key={stage.id} stage={stage} />
        ))}
      </div>

      <div className={cn('mt-10', fadeClass)} style={fadeStyle(200)}>
        <Button
          asChild
          size="lg"
          className={cn('w-full gap-2 rounded-full', !prefersReducedMotion && 'transition-transform active:scale-[0.98]')}
        >
          <Link href="/labs/visual-intelligence/journey">
            Start Journey
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
