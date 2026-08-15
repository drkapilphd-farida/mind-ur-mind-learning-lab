'use client'

import { BrandWatermark } from '@/components/brand/BrandWatermark'
import { useIsEmbeddedExercise } from '@/features/thirty-day-curriculum/embeddedExerciseContext'
import { useImmersiveExerciseLock } from '@/hooks/exercises/useImmersiveExerciseLock'

type ReadingLayoutProps = {
  maxWidthClassName?: string
  onExit: () => void
  children: React.ReactNode
}

const SECONDARY_TEXT_BUTTON_CLASSES =
  'rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-[color,transform] active:scale-95 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50'

// True Full-Screen Viewport Lock™ — top-[max(1rem,env(safe-area-inset-top))]
// keeps the watermark/Exit button clear of a notch/dynamic island on a
// device where the browser chrome doesn't reserve that space itself
// (requires viewportFit: 'cover' in app/layout.tsx — without it,
// env(safe-area-inset-*) always resolves to 0). max() keeps the original
// 1rem spacing on non-notched devices.
const SAFE_TOP = 'top-[max(1rem,env(safe-area-inset-top))]'

// Sprint 3.2A — the one shared reading layout every Reading Mode inherits:
// shared outer container, shared padding/vertical rhythm, shared Exit
// control, and a parametrized "safe reading width" (maxWidthClassName)
// instead of each mode hardcoding its own container class.
//
// Standalone (own route, e.g. /labs/quantum-speed-reading/rsvp): a true
// viewport lock — fixed inset-0, never the page scrolling — with its own
// Exit button and watermark, since no other chrome exists on that route.
//
// Embedded (inside DayMasterPlayer.tsx's wizard — see
// embeddedExerciseContext.tsx): the wizard already renders an equivalent
// Exit/Skip header immediately above this component, so rendering a
// second one here was pure duplicate clutter, and forcing another full
// viewport of height on top of the wizard's own chrome was exactly what
// made the whole page taller than one screen and scroll. Embedded mode
// fills its parent instead of the viewport, and renders only children.
export function ReadingLayout({ maxWidthClassName = 'max-w-md', onExit, children }: ReadingLayoutProps): React.JSX.Element {
  const isEmbedded = useIsEmbeddedExercise()
  // Embedded: DayMasterPlayer.tsx locks the body itself once per wizard
  // session — a second lock here (remounting per step) would fight it.
  useImmersiveExerciseLock(!isEmbedded)

  if (isEmbedded) {
    return (
      <div className={`mx-auto flex size-full ${maxWidthClassName} flex-col items-center overflow-y-auto px-4 py-3`}>{children}</div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
      <BrandWatermark className={`absolute left-4 sm:left-6 ${SAFE_TOP}`} />
      <button onClick={onExit} className={`absolute right-4 sm:right-6 ${SAFE_TOP} ${SECONDARY_TEXT_BUTTON_CLASSES}`} aria-label="Exit exercise">
        Exit
      </button>
      <div className={`mx-auto flex min-h-full ${maxWidthClassName} flex-col items-center px-4 py-4 sm:px-6 sm:py-16`}>{children}</div>
    </div>
  )
}
