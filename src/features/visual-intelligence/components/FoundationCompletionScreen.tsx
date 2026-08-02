'use client'

import Link from 'next/link'
import { ArrowRight, Eye, Sparkles, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

type FoundationCompletionScreenProps = {
  continueHref: string
}

const RESULT_LINES = [
  { icon: Eye, label: 'Visual Readiness Improved' },
  { icon: Sparkles, label: 'Eye Preparation Complete' },
  { icon: BookOpen, label: 'Ready for Reading Intelligence Lab™' },
] as const

// Mirrors ReadingSessionComplete.tsx's visual language (nested-circle mark,
// staggered fade-in). No fabricated numeric stats — there is nothing real
// to quantify yet (no timer/scoring exists this sprint), so results are
// shown as plain, honest statements rather than invented metrics.
export function FoundationCompletionScreen({ continueHref }: FoundationCompletionScreenProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()

  const fadeStyle = (delayMs: number): React.CSSProperties | undefined =>
    !prefersReducedMotion ? { animationDelay: `${delayMs}ms`, animationFillMode: 'backwards' } : undefined
  const fadeClass = !prefersReducedMotion ? 'animate-in fade-in slide-in-from-bottom-2 duration-500' : ''

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-8 text-center">
      <div
        className={cn('flex size-20 items-center justify-center rounded-full bg-primary/[0.07]', !prefersReducedMotion && 'animate-in zoom-in-75 duration-500')}
        aria-hidden="true"
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/[0.12]">
          <div className="size-6 rounded-full bg-primary" />
        </div>
      </div>

      <div className={fadeClass} style={fadeStyle(150)}>
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Foundation Journey™</p>
        <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground">
          Visual Intelligence Foundation™ Completed
        </h1>
      </div>

      <div className={cn('w-full space-y-3', fadeClass)} style={fadeStyle(250)}>
        {RESULT_LINES.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-3 rounded-2xl border bg-card p-4 text-left shadow-sm">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/[0.08] text-primary">
              <Icon className="size-4" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-foreground">{label}</p>
          </div>
        ))}
      </div>

      <div className={cn('w-full', fadeClass)} style={fadeStyle(350)}>
        <Button asChild size="lg" className="w-full gap-2 rounded-full">
          <Link href={continueHref}>
            Continue
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
