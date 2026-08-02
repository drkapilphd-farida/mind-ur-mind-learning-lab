'use client'

type ReadingLayoutProps = {
  maxWidthClassName?: string
  onExit: () => void
  children: React.ReactNode
}

const SECONDARY_TEXT_BUTTON_CLASSES =
  'rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50'

// Sprint 3.2A — the one shared reading layout every Reading Mode inherits:
// shared outer container, shared padding/vertical rhythm, shared Exit
// control, and a parametrized "safe reading width" (maxWidthClassName)
// instead of each mode hardcoding its own container class.
export function ReadingLayout({ maxWidthClassName = 'max-w-md', onExit, children }: ReadingLayoutProps): React.JSX.Element {
  return (
    <div className={`relative mx-auto flex min-h-[70vh] ${maxWidthClassName} flex-col items-center px-6 py-16`}>
      <button onClick={onExit} className={`absolute top-4 right-6 ${SECONDARY_TEXT_BUTTON_CLASSES}`} aria-label="Exit exercise">
        Exit
      </button>
      {children}
    </div>
  )
}
