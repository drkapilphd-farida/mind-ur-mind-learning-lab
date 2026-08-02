'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ExerciseCountdown } from '@/components/exercise-engine/ExerciseCountdown'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

const CHECKLIST_ITEMS = [
  'Sit comfortably',
  'Reduce distractions',
  'Maintain posture',
  'Relax your eyes',
  'Focus your attention',
] as const

type PreReadingChecklistProps = {
  nextHref: string // session-coming-soon target, with mode/passage already in the query string
}

type PrepareSubPhase = 'checklist' | 'countdown'

export function PreReadingChecklist({ nextHref }: PreReadingChecklistProps): React.JSX.Element {
  const router = useRouter()
  const prefersReducedMotion = usePrefersReducedMotion()
  const [subPhase, setSubPhase] = useState<PrepareSubPhase>('checklist')

  function handleCountdownComplete(): void {
    router.push(nextHref)
  }

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-8 text-center">
      {subPhase === 'checklist' && (
        <>
          {/* A calm, concentric breathing visual — CSS-only, gated behind
              reduced-motion exactly like every other animation in this pack. */}
          <div
            aria-hidden="true"
            className={cn(
              'flex size-24 items-center justify-center rounded-full bg-primary/[0.05]',
              !prefersReducedMotion && 'animate-[breathing-pulse_4s_ease-in-out_infinite]',
            )}
          >
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/[0.08]">
              <div className="size-8 rounded-full bg-primary/[0.16]" />
            </div>
          </div>

          <ul className="w-full space-y-3 text-left">
            {CHECKLIST_ITEMS.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-foreground">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                  <Check className="size-3.5" aria-hidden="true" />
                </span>
                {item}
              </li>
            ))}
          </ul>

          <div className="flex w-full flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground">
              When you are ready,<br />press Begin Reading.
            </p>
            <Button
              size="lg"
              className="w-full rounded-full transition-transform active:scale-[0.98]"
              onClick={() => setSubPhase('countdown')}
            >
              Begin Reading
            </Button>
          </div>
        </>
      )}

      {subPhase === 'countdown' && (
        <ExerciseCountdown
          onComplete={handleCountdownComplete}
          readyLabel="Prepare"
          goLabel="Begin"
        />
      )}
    </div>
  )
}
