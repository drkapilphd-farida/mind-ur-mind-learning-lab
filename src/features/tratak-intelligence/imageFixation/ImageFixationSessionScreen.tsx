'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Pause, Play, RotateCcw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProgressRing } from '@/components/exercises/ProgressRing'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { FixationTargetOverlay } from './FixationTargetOverlay'

// Slow, deliberate fade at the end — mirrors ObservationScreen.tsx /
// MandalaSessionScreen.tsx's exact fixed-overlay + fade pattern. Generic
// over `imageSrc` so any image-based mission (Mandala, Image Persistence
// Challenge™) reuses this screen unchanged.
const FADE_OUT_MS = 2000

type ImageFixationSessionScreenProps = {
  imageSrc: string
  imageAlt: string
  durationSeconds: number
  onComplete: () => void
  /** Sprint 10F: fixation anchor position + gentle pulse — both default to
   * Mandala's exact existing look (dead center, never pulses) when omitted. */
  anchorXPercent?: number
  anchorYPercent?: number
  pulse?: boolean
  /** Sprint 10F enhancement: anchor dot diameter in px — defaults to
   * Mandala's exact existing size (14) when omitted. */
  anchorSize?: number
  /** Sprint 10F: when provided, renders Pause/Restart/Exit controls at the
   * bottom. Omitted by Mandala's call site, so its fullscreen no-controls
   * behavior is unchanged. */
  onExit?: () => void
  /** Sprint 52: renders the image as a true negative via Tailwind's
   * `invert` utility (`filter: invert(100%)`) — a lossless, GPU-composited
   * per-pixel inversion of the real decoded image, not a re-encode.
   * Defaults to false, so Mandala's call site (which never passes this) is
   * byte-identical to before. */
  invert?: boolean
}

export function ImageFixationSessionScreen({
  imageSrc,
  imageAlt,
  durationSeconds,
  onComplete,
  anchorXPercent = 50,
  anchorYPercent = 50,
  pulse = false,
  anchorSize = 14,
  onExit,
  invert = false,
}: ImageFixationSessionScreenProps): React.JSX.Element {
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (isPaused) return
    if (remainingSeconds <= 0) {
      setIsFadingOut(true)
      const fadeTimer = setTimeout(onComplete, prefersReducedMotion ? 0 : FADE_OUT_MS)
      return () => clearTimeout(fadeTimer)
    }
    const tickTimer = setTimeout(() => setRemainingSeconds((seconds) => seconds - 1), 1000)
    return () => clearTimeout(tickTimer)
  }, [remainingSeconds, onComplete, prefersReducedMotion, isPaused])

  const handleRestart = (): void => {
    setRemainingSeconds(durationSeconds)
    setIsFadingOut(false)
    setIsPaused(false)
  }

  return (
    // Deliberately dark regardless of ambient theme — a distraction-free,
    // premium viewing window. The image never animates, zooms, rotates, or
    // shifts — only its container's opacity fades at the very end.
    <div className="dark fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-neutral-950 px-6">
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">{isPaused ? 'Paused.' : 'Breathe naturally.'}</p>

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
          src={imageSrc}
          alt={imageAlt}
          fill
          className={cn('object-cover', invert && 'invert')}
          sizes="(max-width: 640px) 100vw, 448px"
          priority
          // Sprint 53: local SVGs (the new premium Image Persistence assets)
          // bypass next/image's built-in optimizer, which 400s on SVG
          // sources by default since next.config.ts sets no
          // dangerouslyAllowSVG — `unoptimized` serves the raw file as-is
          // instead. A no-op for every raster (.jpg) source, including
          // every Mandala/Candle Tratak call site, which never pass `.svg`.
          unoptimized={imageSrc.endsWith('.svg')}
        />
        {/* soft vignette — reusable regardless of the artwork behind it */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ boxShadow: 'inset 0 0 140px 45px rgba(0,0,0,0.7)' }}
          aria-hidden="true"
        />
        <FixationTargetOverlay xPercent={anchorXPercent} yPercent={anchorYPercent} pulse={pulse === true && !prefersReducedMotion} size={anchorSize} />
      </div>

      <ProgressRing
        progress={remainingSeconds / durationSeconds}
        size={96}
        label={String(remainingSeconds)}
        accessibleLabel={`${remainingSeconds} seconds remaining`}
      />

      {onExit !== undefined && (
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-1.5 rounded-full" onClick={() => setIsPaused((current) => !current)}>
            {isPaused ? <Play className="size-3.5" aria-hidden="true" /> : <Pause className="size-3.5" aria-hidden="true" />}
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 rounded-full" onClick={handleRestart}>
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Restart
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 rounded-full" onClick={onExit}>
            <X className="size-3.5" aria-hidden="true" />
            Exit
          </Button>
        </div>
      )}
    </div>
  )
}
