'use client'

import { Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { CATEGORY_LABEL, type LibraryImage } from '../../image-persistence/imageLibrary'

type ImagePersistenceReadyProps = {
  image: LibraryImage
  onBegin: () => void
}

// Covers the brief's "Instructions" + "Ready Screen" flow steps as one
// screen. Sprint-3B adds the "Today's Visual Challenge" summary (Category /
// Target / Focus Duration) above the existing instruction copy — this is
// this stage's "before each image" session intro.
export function ImagePersistenceReady({ image, onBegin }: ImagePersistenceReadyProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="rounded-2xl border bg-card p-6 text-left shadow-sm">
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Today&apos;s Visual Challenge</p>
        <dl className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <dt className="text-muted-foreground">Category</dt>
            <dd className="font-semibold text-foreground">{CATEGORY_LABEL[image.category]}</dd>
          </div>
          <div className="flex items-center justify-between text-sm">
            <dt className="text-muted-foreground">Target</dt>
            <dd className="font-semibold text-foreground">{image.title}</dd>
          </div>
          <div className="flex items-center justify-between text-sm">
            <dt className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="size-3.5" aria-hidden="true" />
              Focus Duration
            </dt>
            <dd className="font-semibold text-foreground">{image.duration} Seconds</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Before You Begin</p>
        <p className="mt-4 text-lg leading-relaxed font-medium text-foreground">
          Focus gently on the center of the image.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Observe every detail. Do not move your eyes unnecessarily.
        </p>
        <Button
          size="lg"
          className={cn('mt-8 w-full rounded-full', !prefersReducedMotion && 'transition-transform active:scale-[0.98]')}
          onClick={onBegin}
        >
          Begin Session
        </Button>
      </div>
    </div>
  )
}
