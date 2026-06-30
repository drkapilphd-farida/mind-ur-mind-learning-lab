'use client'

// FlashStimulus — renders the stimulus briefly then calls onHide.
// Universal: works for text, numbers, symbols, letters. Icon rendering
// added per exercise via the renderStimulus prop (same pattern as FlashCanvas).

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import type { SessionItemRenderMode } from '@/types/exercise-engine'

type FlashStimulusProps = {
  stimulus: string
  renderAs?: SessionItemRenderMode
  durationMs: number
  onHide: () => void
  // Optional custom renderer for icon-based exercises
  renderStimulus?: (stimulus: string) => React.ReactNode
}

export function FlashStimulus({
  stimulus,
  renderAs = 'text',
  durationMs,
  onHide,
  renderStimulus,
}: FlashStimulusProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Honor reduced-motion: never flash shorter than 300ms
  const effectiveDuration = prefersReducedMotion ? Math.max(durationMs, 300) : durationMs

  useEffect(() => {
    timerRef.current = setTimeout(onHide, effectiveDuration)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [effectiveDuration, onHide])

  const isLargeSymbol = renderAs === 'symbol' || renderAs === 'number' || renderAs === 'letter'

  return (
    <div
      className={cn(
        'flex min-h-[140px] items-center justify-center',
        !prefersReducedMotion && 'animate-in fade-in duration-75',
      )}
      aria-live="assertive"
      aria-label={`Flash: ${stimulus}`}
    >
      {renderStimulus ? (
        renderStimulus(stimulus)
      ) : (
        <span
          className={cn(
            'select-none text-center font-bold tracking-tight text-foreground',
            isLargeSymbol
              ? 'text-7xl sm:text-8xl'
              : 'text-5xl sm:text-6xl',
          )}
          aria-hidden="true"
        >
          {stimulus}
        </span>
      )}
    </div>
  )
}
