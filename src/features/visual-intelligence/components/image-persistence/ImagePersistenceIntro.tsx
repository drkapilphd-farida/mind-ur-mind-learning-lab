'use client'

import { Clock, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import type { FoundationStage } from '../../foundationStages'

type ImagePersistenceIntroProps = {
  stage: FoundationStage
  onStart: () => void
}

const SAFETY_NOTES = ['Sit comfortably.', 'Keep blinking naturally.', 'Do not strain.'] as const

// Sprint-3 — Image Persistence Challenge™'s own intro screen. A bespoke
// sibling of Sprint-2's StageIntroScreen (not a reuse or modification of
// it) since this experience needs a Safety Note card the generic one
// doesn't have.
export function ImagePersistenceIntro({ stage, onStart }: ImagePersistenceIntroProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const Icon = stage.icon

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-8 text-center">
      <div
        className={cn('flex size-20 items-center justify-center rounded-full bg-primary/[0.07]', !prefersReducedMotion && 'animate-in zoom-in-75 duration-500')}
        aria-hidden="true"
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/[0.12] text-primary">
          <Icon className="size-6" aria-hidden="true" />
        </div>
      </div>

      <div>
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Stage {stage.order} of 5</p>
        <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground">{stage.title}</h1>
        <p className="mt-3 text-base leading-relaxed text-foreground/80">{stage.subtitle}</p>
      </div>

      <div className="w-full rounded-2xl border bg-card p-6 text-left shadow-sm">
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Purpose</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{stage.purpose}</p>
      </div>

      <div className="w-full rounded-2xl border bg-card p-6 text-left shadow-sm">
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Benefits</p>
        <ul className="mt-3 space-y-2">
          {stage.benefits.map((benefit) => (
            <li key={benefit} className="flex items-center gap-2.5 text-sm text-foreground">
              <span className="size-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              {benefit}
            </li>
          ))}
        </ul>
      </div>

      <div className="w-full rounded-2xl border bg-card p-6 text-left shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-muted-foreground" aria-hidden="true" />
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Safety Note</p>
        </div>
        <ul className="mt-3 space-y-1.5">
          {SAFETY_NOTES.map((note) => (
            <li key={note} className="text-sm text-muted-foreground">{note}</li>
          ))}
        </ul>
      </div>

      {/* Hardcoded, not read from stage.estimatedDuration ("90-120 sec" —
          Sprint-2's value, a shared field on foundationStages.ts, which
          Sprint-3 must not touch). This screen's real, fixed session
          length is 45 seconds, per this sprint's own spec. */}
      <span className="inline-flex items-center gap-1.5 rounded-full border border-foreground/10 px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
        <Clock className="size-3.5" aria-hidden="true" />
        Estimated Time: 45 Seconds
      </span>

      <Button
        size="lg"
        className={cn('w-full rounded-full', !prefersReducedMotion && 'transition-transform active:scale-[0.98]')}
        onClick={onStart}
      >
        Start
      </Button>
    </div>
  )
}
