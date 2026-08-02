'use client'

import Link from 'next/link'
import { ArrowLeft, BarChart3, Check, Flower2 } from 'lucide-react'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { MANDALA_LEVELS } from '../../mandalaLevels'
import type { MandalaLevel } from '../../mandalaLevels'
import { MandalaLevelCard } from './MandalaLevelCard'

const BENEFITS = [
  'Improves eye fixation',
  'Improves sustained attention',
  'Reduces unnecessary eye movement',
  'Builds visual stability',
] as const

type MandalaMissionOverviewScreenProps = {
  levels: readonly MandalaLevel[]
  currentLevelOrder: number | null
  devBypassLocks: boolean
  onSelectLevel: (order: number) => void
}

// Sprint 10C: replaces the Sprint-10B single "Begin Training" intro —
// Mandala Tratak™ is now a 5-level mission, so the entry screen shows the
// full roadmap instead of jumping straight into one exercise.
export function MandalaMissionOverviewScreen({
  levels,
  currentLevelOrder,
  devBypassLocks,
  onSelectLevel,
}: MandalaMissionOverviewScreenProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const fadeClass = !prefersReducedMotion ? 'animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-backwards' : ''
  const fadeStyle = (delayMs: number): React.CSSProperties | undefined =>
    !prefersReducedMotion ? { animationDelay: `${delayMs}ms`, animationFillMode: 'backwards' } : undefined

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-8 text-center">
      <Link
        href="/labs/visual-intelligence/tratak"
        className="self-start inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Back to Tratak Intelligence Journey™
      </Link>

      <div
        className={cn('flex size-24 items-center justify-center rounded-full bg-primary/[0.07]', !prefersReducedMotion && 'animate-in zoom-in-75 duration-700')}
        aria-hidden="true"
      >
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/[0.12] text-primary">
          <Flower2 className="size-7" aria-hidden="true" />
        </div>
      </div>

      <div className={fadeClass} style={fadeStyle(100)}>
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Tratak Intelligence Journey™ · Mission 1</p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground">Mandala Tratak™</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Train your visual fixation using beautiful symmetrical mandalas.
        </p>
      </div>

      <ul className={cn('w-full space-y-2 rounded-2xl border bg-card p-5 text-left shadow-sm', fadeClass)} style={fadeStyle(180)}>
        {BENEFITS.map((benefit) => (
          <li key={benefit} className="flex items-center gap-2.5 text-sm text-foreground">
            <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
            {benefit}
          </li>
        ))}
      </ul>

      <div className={cn('w-full space-y-3', fadeClass)} style={fadeStyle(240)}>
        <p className="text-left text-xs font-medium tracking-widest text-muted-foreground uppercase">5-Level Mission Roadmap</p>
        {MANDALA_LEVELS.map((definition) => {
          const level = levels.find((candidate) => candidate.order === definition.order)
          const status = level?.status ?? 'locked'
          return (
            <MandalaLevelCard
              key={definition.order}
              order={definition.order}
              title={definition.title}
              difficulty={definition.difficulty}
              durationSeconds={definition.durationSeconds}
              xpReward={definition.xpReward}
              status={status}
              isCurrent={currentLevelOrder === definition.order}
              canSelect={status !== 'locked' || devBypassLocks}
              onSelect={() => onSelectLevel(definition.order)}
            />
          )
        })}
      </div>

      <Link
        href="/labs/visual-intelligence/tratak/mandala/reports"
        className={cn('inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground', fadeClass)}
        style={fadeStyle(280)}
      >
        <BarChart3 className="size-3.5" aria-hidden="true" />
        View Report History
      </Link>
    </div>
  )
}
