'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { ExerciseProgressBar } from './ExerciseProgressBar'

type ExercisePracticeLayoutProps = {
  progress: number
  onExit: () => void
  children: React.ReactNode
}

// The chrome every exercise's active phase shares: an exit affordance and a
// calm, non-numeric progress bar, with the rest of the screen free for the
// exercise's own content. Used by every Quantum Speed Reading / Memory /
// Focus exercise's canvas — never duplicate this layout per exercise.
// Escape mirrors the exit button — the calm desktop equivalent of dismissing.
export function ExercisePracticeLayout({
  progress,
  onExit,
  children,
}: ExercisePracticeLayoutProps): React.JSX.Element {
  // `onExit` is typically recreated every render by a canvas re-rendering on
  // every animation frame — keep the listener mount-once via a ref instead of
  // tearing it down 60 times a second.
  const onExitRef = useRef(onExit)
  onExitRef.current = onExit

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        onExitRef.current()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    // Immersive Exercise Mode™ — max() keeps the original 1.5rem/2rem
    // padding on non-notched devices; on a device with a notch/dynamic
    // island, env(safe-area-inset-*) grows the padding instead of the
    // header sitting underneath it. Requires viewportFit: 'cover' in
    // app/layout.tsx — without it these env() calls always resolve to 0.
    <div className="flex min-h-[100dvh] flex-col px-[max(1.5rem,env(safe-area-inset-left))] py-[max(1.5rem,env(safe-area-inset-top))] sm:px-[max(2.5rem,env(safe-area-inset-left))] sm:py-[max(2rem,env(safe-area-inset-top))]">
      <div className="flex w-full items-center gap-4">
        <button
          type="button"
          onClick={onExit}
          aria-label="End practice early"
          className="shrink-0 rounded-full p-2 text-muted-foreground transition-[color,transform] active:scale-95 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
        <div className="flex-1">
          <ExerciseProgressBar progress={progress} />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center pb-[env(safe-area-inset-bottom)]">{children}</div>
    </div>
  )
}
