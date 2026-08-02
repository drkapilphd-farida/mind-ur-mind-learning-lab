'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ProgressRing } from '@/components/exercises/ProgressRing'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import type { PersistenceChallengeImage } from '../../persistence-challenge/persistenceChallengeImages'

// Slow, deliberate fades — the brief is explicit: "never disappear
// instantly." A bespoke sibling of Sprint-3B's ImagePersistenceSession.tsx
// (same fixed-overlay + ProgressRing shape), not a modification of it.
const FADE_OUT_MS = 2000

type ObservationScreenProps = {
  image: PersistenceChallengeImage
  onComplete: () => void
}

export function ObservationScreen({ image, onComplete }: ObservationScreenProps): React.JSX.Element {
  const [remainingSeconds, setRemainingSeconds] = useState(image.duration)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (remainingSeconds <= 0) {
      setIsFadingOut(true)
      const fadeTimer = setTimeout(onComplete, prefersReducedMotion ? 0 : FADE_OUT_MS)
      return () => clearTimeout(fadeTimer)
    }
    const tickTimer = setTimeout(() => setRemainingSeconds((seconds) => seconds - 1), 1000)
    return () => clearTimeout(tickTimer)
  }, [remainingSeconds, onComplete, prefersReducedMotion])

  return (
    // Deliberately dark regardless of ambient theme — a distraction-free
    // viewing window, same convention as the Sprint-3B precedent.
    <div className="dark fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-neutral-950 px-6">
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Observe carefully. Do not analyse. Simply watch.</p>

      <div
        className={cn(
          'relative aspect-square w-full max-w-md overflow-hidden rounded-3xl shadow-2xl shadow-black/60',
          !prefersReducedMotion && 'transition-opacity ease-out',
          isFadingOut
            ? cn('opacity-0', !prefersReducedMotion && 'duration-[2000ms]')
            : cn('opacity-100', !prefersReducedMotion && 'animate-in fade-in duration-[2000ms]'),
        )}
      >
        <Image
          src={image.filePath}
          alt={`${image.title} — Image Persistence Challenge™ observation image`}
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
