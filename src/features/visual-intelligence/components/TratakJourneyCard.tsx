'use client'

import Link from 'next/link'
import { ArrowRight, Eye, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProgressRing } from '@/components/exercises/ProgressRing'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

const TRAIN_ITEMS = ['Eye Fixation', 'Visual Persistence', 'Observation', 'Inner Light Awareness', 'Candle Tratak'] as const

type TratakJourneyCardProps = {
  isUnlocked: boolean
  progressPercent: number
  xp: number
  level: number
  persistenceScore: number
  estimatedDurationLabel: string
}

// The second Journey's featured card on the Visual Intelligence Home. Unlike
// FoundationStagePreviewCard (deliberately non-interactive), this card IS
// clickable once unlocked — Journey-2 is a real, separately-persisted
// experience, not a stateless preview.
export function TratakJourneyCard({
  isUnlocked,
  progressPercent,
  xp,
  level,
  persistenceScore,
  estimatedDurationLabel,
}: TratakJourneyCardProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl border bg-card p-6 shadow-sm',
        !prefersReducedMotion && 'transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/[0.08] text-primary">
            <Eye className="size-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">Tratak Intelligence Journey™</p>
            <span
              className={cn(
                'mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                isUnlocked ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground',
              )}
            >
              {!isUnlocked && <Lock className="size-3" aria-hidden="true" />}
              {isUnlocked ? 'Unlocked' : 'Locked'}
            </span>
          </div>
        </div>
        <ProgressRing
          progress={progressPercent / 100}
          size={64}
          label={`${progressPercent}%`}
          accessibleLabel={`Journey ${progressPercent}% complete`}
        />
      </div>

      <p className="mt-4 text-xs font-medium tracking-widest text-muted-foreground uppercase">Train</p>
      <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
        {TRAIN_ITEMS.map((item) => (
          <li key={item} className="flex items-center gap-1.5">
            <span className="size-1 shrink-0 rounded-full bg-primary/50" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-5 grid grid-cols-4 gap-2 rounded-2xl bg-muted/30 p-3 text-center">
        <div>
          <p className="text-sm font-semibold text-foreground">{xp}</p>
          <p className="text-[10px] text-muted-foreground">XP</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{level}</p>
          <p className="text-[10px] text-muted-foreground">Level</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{persistenceScore}</p>
          <p className="text-[10px] text-muted-foreground">Persistence</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{estimatedDurationLabel}</p>
          <p className="text-[10px] text-muted-foreground">Duration</p>
        </div>
      </div>

      {isUnlocked ? (
        <Button
          asChild
          size="lg"
          className={cn('mt-5 w-full gap-2 rounded-full', !prefersReducedMotion && 'transition-transform active:scale-[0.98]')}
        >
          <Link href="/labs/visual-intelligence/tratak">
            Continue
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      ) : (
        <Button size="lg" disabled className="mt-5 w-full gap-2 rounded-full">
          <Lock className="size-4" aria-hidden="true" />
          Locked — Complete the Foundation Journey
        </Button>
      )}
    </div>
  )
}
