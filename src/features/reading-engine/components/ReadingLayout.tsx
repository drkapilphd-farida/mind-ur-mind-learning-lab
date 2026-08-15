'use client'

import { BrandWatermark } from '@/components/brand/BrandWatermark'

type ReadingLayoutProps = {
  maxWidthClassName?: string
  onExit: () => void
  children: React.ReactNode
}

const SECONDARY_TEXT_BUTTON_CLASSES =
  'rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-[color,transform] active:scale-95 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50'

// Immersive Exercise Mode™ — top-4/left-6/right-6 alone would place the
// watermark/Exit button under a notch or dynamic island on a device
// where the browser chrome doesn't reserve that space itself (this
// layout runs full-bleed, with no dashboard chrome above it — see
// viewportFit: 'cover' in app/layout.tsx, the prerequisite that makes
// env(safe-area-inset-*) resolve to a real value instead of always 0).
// max() keeps the original 1rem/1.5rem spacing on non-notched devices —
// this never shrinks below what the layout already looked like.
const SAFE_TOP = 'top-[max(1rem,env(safe-area-inset-top))]'

// Sprint 3.2A — the one shared reading layout every Reading Mode inherits:
// shared outer container, shared padding/vertical rhythm, shared Exit
// control, and a parametrized "safe reading width" (maxWidthClassName)
// instead of each mode hardcoding its own container class.
export function ReadingLayout({ maxWidthClassName = 'max-w-md', onExit, children }: ReadingLayoutProps): React.JSX.Element {
  return (
    <div className={`relative mx-auto flex min-h-[100dvh] ${maxWidthClassName} flex-col items-center px-6 py-16`}>
      <BrandWatermark className={`absolute left-6 ${SAFE_TOP}`} />
      <button onClick={onExit} className={`absolute right-6 ${SAFE_TOP} ${SECONDARY_TEXT_BUTTON_CLASSES}`} aria-label="Exit exercise">
        Exit
      </button>
      {children}
    </div>
  )
}
