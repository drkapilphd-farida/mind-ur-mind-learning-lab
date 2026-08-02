'use client'

import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProgressRing } from '@/components/exercises/ProgressRing'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { CATEGORY_LABEL, CATEGORY_ROTATION_ORDER, type LibraryImage } from '../../image-persistence/imageLibrary'

type ImagePersistenceCompletionProps = {
  image: LibraryImage
  /** 0-based position within the current 5-category rotation cycle. */
  cycleIndex: number
  onContinue: () => void
}

// Flat, disclosed per-session reward — never a fabricated cumulative
// total (no XP-tracking table exists, and this sprint adds none).
const XP_PER_SESSION = 25

// Stage 3 is never the journey's last stage, so the button is always
// "Continue" — no isLastStage prop needed, unlike the generic
// StageCompletionScreen this component is a bespoke sibling of.
export function ImagePersistenceCompletion({ image, cycleIndex, onContinue }: ImagePersistenceCompletionProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()

  // Mind Score here reflects real rotation-cycle progress (how many of the
  // 5 categories have been visited this cycle, including this session) —
  // never the learner's subjective observation outcome. "Nothing yet." is
  // a normal, valid result and must never look like a worse score.
  const cycleProgress = (cycleIndex + 1) / CATEGORY_ROTATION_ORDER.length
  const mindScore = Math.round(cycleProgress * 100)

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-8 text-center">
      <div
        className={cn('flex size-24 items-center justify-center rounded-full bg-primary/[0.07]', !prefersReducedMotion && 'animate-in zoom-in-75 duration-500')}
        aria-hidden="true"
      >
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/[0.12] text-primary">
          <Sparkles className="size-7" aria-hidden="true" />
        </div>
      </div>

      <div>
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Stage 3 of 5</p>
        <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground">Image Persistence Complete™</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Nicely done — you practiced sustained visual fixation and calm observation.
        </p>
      </div>

      <div className="flex w-full items-center gap-5 rounded-2xl border bg-card p-6 shadow-sm">
        <ProgressRing
          progress={cycleProgress}
          size={72}
          label={`${mindScore}`}
          accessibleLabel={`Mind Score ${mindScore} out of 100`}
        />
        <div className="flex-1 space-y-2 text-left">
          <div>
            <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Mind Score</p>
            <p className="text-sm font-semibold text-foreground">{mindScore} / 100</p>
          </div>
          <div>
            <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Visual Intelligence XP</p>
            <p className="text-sm font-semibold text-foreground">+{XP_PER_SESSION} XP</p>
          </div>
        </div>
      </div>

      <div className="w-full rounded-2xl border bg-card p-4 shadow-sm">
        <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Category Completed</p>
        <p className="mt-1 text-sm font-semibold text-foreground">{CATEGORY_LABEL[image.category]}</p>
      </div>

      <Button
        size="lg"
        className={cn('w-full gap-2 rounded-full', !prefersReducedMotion && 'transition-transform active:scale-[0.98]')}
        onClick={onContinue}
      >
        Continue Journey
        <ArrowRight className="size-4" aria-hidden="true" />
      </Button>
    </div>
  )
}
