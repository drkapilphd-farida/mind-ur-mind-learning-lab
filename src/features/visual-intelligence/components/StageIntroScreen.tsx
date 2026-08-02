'use client'

import { Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import type { FoundationStage } from '../foundationStages'

type StageIntroScreenProps = {
  stage: FoundationStage
  onStart: () => void
}

// Sprint-2 — the first screen of a stage's guided experience: hero icon,
// title/subtitle, Purpose card, Benefits card, estimated time, a short
// motivational quote, and a Start button. Renders once per stage, inside
// StageExperience's own key'd fade wrapper.
export function StageIntroScreen({ stage, onStart }: StageIntroScreenProps): React.JSX.Element {
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

      <span className="inline-flex items-center gap-1.5 rounded-full border border-foreground/10 px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
        <Clock className="size-3.5" aria-hidden="true" />
        Estimated Time: {stage.estimatedDuration}
      </span>

      <p className="text-sm leading-relaxed text-muted-foreground italic">&ldquo;{stage.quote}&rdquo;</p>

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
