'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ProgressRing } from '@/components/exercises/ProgressRing'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import type { LibraryImage } from '../../image-persistence/imageLibrary'

const FADE_OUT_MS = 500

type ImagePersistenceSessionProps = {
  image: LibraryImage
  onComplete: () => void
}

// The one real timer in this sprint: a genuine countdown (image.duration
// seconds — 45 in this version, but reading it from the registry rather
// than a hardcoded constant means a future 30/60/90s image needs zero
// engine changes), no exercise-scoring logic — just a calm,
// distraction-free viewing window. Reuses ProgressRing
// (src/components/exercises/ProgressRing.tsx) unmodified. `fixed inset-0`
// deliberately covers the outer journey's own 5-stage progress indicator
// for the session's duration — "no buttons, no distractions" — without
// touching that component at all.
export function ImagePersistenceSession({ image, onComplete }: ImagePersistenceSessionProps): React.JSX.Element {
  const [remainingSeconds, setRemainingSeconds] = useState(image.duration)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (remainingSeconds <= 0) {
      setIsFadingOut(true)
      const fadeTimer = setTimeout(onComplete, FADE_OUT_MS)
      return () => clearTimeout(fadeTimer)
    }
    const tickTimer = setTimeout(() => setRemainingSeconds((seconds) => seconds - 1), 1000)
    return () => clearTimeout(tickTimer)
  }, [remainingSeconds, onComplete])

  return (
    // `dark` is added literally here (not conditional on the site's own
    // theme toggle) — this screen is deliberately dark regardless of light
    // vs dark mode, so ProgressRing's theme-adaptive tokens (text-foreground,
    // stroke-primary) need the dark palette's CSS custom properties to stay
    // visible against this always-dark background, not whatever the
    // ambient theme happens to be.
    <div className="dark fixed inset-0 z-50 flex flex-col items-center justify-center gap-10 bg-neutral-950 px-6">
      <div
        className={cn(
          'relative aspect-square w-full max-w-md overflow-hidden rounded-3xl shadow-2xl shadow-black/60',
          !prefersReducedMotion && 'animate-in zoom-in-95 fade-in duration-700',
          !prefersReducedMotion && 'transition-opacity ease-out',
          isFadingOut ? cn('opacity-0', !prefersReducedMotion && 'duration-500') : cn('opacity-100', !prefersReducedMotion && 'duration-700'),
        )}
      >
        <Image
          src={image.filePath}
          alt={`${image.title} — focus image for visual persistence practice`}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 448px"
          priority
        />
      </div>
      <ProgressRing
        progress={remainingSeconds / image.duration}
        size={96}
        label={String(remainingSeconds)}
        accessibleLabel={`${remainingSeconds} seconds remaining`}
      />
    </div>
  )
}
