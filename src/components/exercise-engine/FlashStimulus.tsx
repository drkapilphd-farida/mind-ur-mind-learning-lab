'use client'

// FlashStimulus — renders the stimulus briefly then calls onHide.
// Universal: works for text, numbers, symbols, letters. Icon rendering
// added per exercise via the renderStimulus prop (same pattern as FlashCanvas).

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { FitText } from '@/components/typography/FitText'
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
        // w-full + min-w-0 are load-bearing, not decorative: this div has
        // no explicit width and is a shrink-to-fit child of a flex-col
        // items-center parent (UniversalExercisePlayer's wrapper) — for a
        // single short stimulus that's invisible, but a custom
        // renderStimulus rendering multiple stacked lines (e.g. Multi-Line
        // Reading's full paragraph) can trigger the same min-content
        // collapse overflow-wrap: anywhere causes elsewhere (verified
        // live: without this, every line rendered as a vertical stack of
        // single characters). w-full anchors this div to the ancestor's
        // definite max-w-sm width instead of leaving it to resolve
        // ambiguous nested min-content.
        'flex min-h-[140px] w-full min-w-0 items-center justify-center',
        !prefersReducedMotion && 'animate-in fade-in duration-75',
      )}
      aria-live="assertive"
      aria-label={`Flash: ${stimulus}`}
    >
      {renderStimulus ? (
        renderStimulus(stimulus)
      ) : (
        <FitText
          text={stimulus}
          role={isLargeSymbol ? 'symbol' : 'display'}
          className="select-none text-center font-bold tracking-tight text-foreground"
          aria-hidden="true"
        />
      )}
    </div>
  )
}
