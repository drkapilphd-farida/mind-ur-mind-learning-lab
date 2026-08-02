'use client'

import Link from 'next/link'
import { ArrowRight, Zap, Brain, Eye, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { SprintStepIndicator } from './SprintStepIndicator'
import { LAB_STAT_LABEL_CLASS } from './shell/LabPageHeader'

type QuantumReadingLandingProps = {
  mindScore: number
  mindScoreLabel: string
  currentStreak: number
  ctaLabel: string
  ctaHref: string
  todaysGoal: string
}

const MODE_SELECT_HREF_FALLBACK = '/labs/quantum-speed-reading/start/mode'

const FEATURE_CHIPS = [
  { icon: Zap, label: 'Faster Reading' },
  { icon: Brain, label: 'Better Comprehension' },
  { icon: Eye, label: 'Reduced Eye Movement' },
  { icon: TrendingUp, label: 'Progressive Training' },
] as const

// Session Time / Target WPM / Expected Comprehension are honestly derived
// from a chosen passage (see passage/prepare screens) — nothing here is
// fabricated for a passage that hasn't been picked yet, so this screen
// shows a plain, disclosed placeholder for those three fields instead of
// inventing a number.
export function QuantumReadingLanding({
  mindScore,
  mindScoreLabel,
  currentStreak,
  ctaLabel,
  ctaHref,
  todaysGoal,
}: QuantumReadingLandingProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()

  const fadeClass = !prefersReducedMotion ? 'animate-in fade-in slide-in-from-bottom-2 duration-700 fill-mode-backwards' : ''
  const fadeStyle = (delayMs: number): React.CSSProperties | undefined =>
    !prefersReducedMotion ? { animationDelay: `${delayMs}ms`, animationFillMode: 'backwards' } : undefined

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-12 px-6 py-20 text-center sm:py-28">
      <div className={fadeClass} style={fadeStyle(0)}>
        <SprintStepIndicator currentStep={1} />
      </div>

      {/* Premium mark — reuses the exact nested-circle language already
          established in ReadingIntelligenceActivatedCard, not a new
          illustration asset/pipeline. */}
      <div
        className={cn('flex size-24 items-center justify-center rounded-full bg-primary/[0.06]', fadeClass)}
        style={fadeStyle(80)}
        aria-hidden="true"
      >
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/[0.10]">
          <div className="size-7 rounded-full bg-primary" />
        </div>
      </div>

      <div className={fadeClass} style={fadeStyle(160)}>
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Reading Intelligence Lab™
        </p>
        <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight text-balance text-foreground sm:text-5xl">
          Quantum Speed Reading™
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-2xl leading-snug font-medium text-balance text-foreground/80 sm:text-3xl">
          Read entire pages,<br className="hidden sm:block" /> not individual words.
        </p>
        <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
          Train your brain to recognize complete meaning instead of reading word by word — one calm session at a time.
        </p>
      </div>

      <div className={cn('flex flex-wrap items-center justify-center gap-2', fadeClass)} style={fadeStyle(240)}>
        {FEATURE_CHIPS.map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 rounded-full border border-foreground/10 px-3.5 py-1.5 text-xs font-medium text-muted-foreground"
          >
            <Icon className="size-3.5" aria-hidden="true" />
            {label}
          </span>
        ))}
      </div>

      <div
        className={cn('grid w-full grid-cols-2 gap-3 sm:grid-cols-4', fadeClass)}
        style={fadeStyle(320)}
      >
        <div className="rounded-xl bg-muted/40 px-3 py-4">
          <p className={LAB_STAT_LABEL_CLASS}>Reading Intelligence™</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{mindScoreLabel}</p>
        </div>
        <div className="rounded-xl bg-muted/40 px-3 py-4">
          <p className={LAB_STAT_LABEL_CLASS}>Mind Score™</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-foreground">{mindScore}</p>
        </div>
        <div className="rounded-xl bg-muted/40 px-3 py-4">
          <p className={LAB_STAT_LABEL_CLASS}>Current Streak</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-foreground">{currentStreak}d</p>
        </div>
        <div className="rounded-xl bg-muted/40 px-3 py-4">
          <p className={LAB_STAT_LABEL_CLASS}>Today&apos;s Goal</p>
          <p className="mt-1 text-xs leading-snug font-medium text-foreground">{todaysGoal}</p>
        </div>
      </div>

      <div
        className={cn('grid w-full grid-cols-1 gap-3 sm:grid-cols-3', fadeClass)}
        style={fadeStyle(400)}
      >
        <div className="rounded-xl border border-dashed border-foreground/15 px-3 py-4">
          <p className={LAB_STAT_LABEL_CLASS}>Estimated Session Time</p>
          <p className="mt-1 text-xs text-muted-foreground">Select a passage to see your estimate</p>
        </div>
        <div className="rounded-xl border border-dashed border-foreground/15 px-3 py-4">
          <p className={LAB_STAT_LABEL_CLASS}>Target WPM</p>
          <p className="mt-1 text-xs text-muted-foreground">Select a passage to see your target</p>
        </div>
        <div className="rounded-xl border border-dashed border-foreground/15 px-3 py-4">
          <p className={LAB_STAT_LABEL_CLASS}>Expected Comprehension</p>
          <p className="mt-1 text-xs text-muted-foreground">Establishing your baseline</p>
        </div>
      </div>

      <div className={fadeClass} style={fadeStyle(480)}>
        <Button
          asChild
          size="lg"
          className={cn('h-11 gap-2 rounded-full px-9 text-base', !prefersReducedMotion && 'transition-transform active:scale-[0.98]')}
        >
          <Link href={ctaHref || MODE_SELECT_HREF_FALLBACK}>
            {ctaLabel === 'Start Reading' ? 'Start Reading Journey' : ctaLabel}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
