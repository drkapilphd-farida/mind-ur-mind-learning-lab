'use client'

import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { LAB_STAT_LABEL_CLASS } from '../shell/LabPageHeader'

type AiMentorCardProps = {
  observation: string
}

export function AiMentorCard({ observation }: AiMentorCardProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className={cn('flex items-center gap-3', !prefersReducedMotion && 'animate-in fade-in duration-500')}>
        <div className="flex size-10 items-center justify-center rounded-full bg-primary/[0.08]" aria-hidden="true">
          <div className="size-5 rounded-full bg-primary/[0.2]" />
        </div>
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Dr. Kapil&apos;s Note™</p>
      </div>
      <p className={cn('mt-3', LAB_STAT_LABEL_CLASS)}>Today&apos;s Observation</p>
      <p className="mt-1.5 text-base leading-relaxed text-foreground italic">&ldquo;{observation}&rdquo;</p>
    </div>
  )
}
