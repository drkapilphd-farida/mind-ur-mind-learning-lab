'use client'

import { useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'

type PrimaryLearningMethodCardFormat = {
  emoji: string
  label: string
}

type PrimaryLearningMethodCardProps = {
  emoji: string
  title: string
  subtitle: string
  // Independent, order-free options — rendered as elegant standalone pills
  // (e.g. Upload & Learn™'s "what you can bring").
  formats?: readonly PrimaryLearningMethodCardFormat[]
  // A *sequential* outcome flow — rendered as pills connected by small
  // arrow separators (e.g. Record & Learn™'s Lecture → AI → ... chain).
  // Deliberately a separate prop from `formats`, since the two read
  // differently (independent choices vs. an implied order) and are never
  // used by the same card.
  flowSteps?: readonly string[]
  illustration?: React.ReactNode
  ctaLabel?: string
  onSelect: () => void
}

// Premium Learning Cards™ (Sprint LW-1C.1) — the two large hero cards
// across the Choose Learning Method™ flow. Reuses the same glassmorphism
// vocabulary established in this codebase (bg-background/60 backdrop-blur,
// soft border) but with premium proportions (more whitespace, larger
// radius, larger icon), a soft hover glow layered under the existing
// lift/shadow, and a brief "selected" confirmation (glow + accent border +
// slight scale) before the parent's onSelect actually navigates —
// "Hover → Lift → Glow → Selected." Both callers pass this exact same
// component with the same prop shape, so "neither should dominate" stays a
// structural guarantee, not just a styling suggestion.
const SELECTION_HOLD_MS = 280

export function PrimaryLearningMethodCard({ emoji, title, subtitle, formats, flowSteps, illustration, ctaLabel, onSelect }: PrimaryLearningMethodCardProps): React.JSX.Element {
  const [isSelected, setIsSelected] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()

  const handleClick = (): void => {
    if (isSelected) return
    if (prefersReducedMotion) {
      onSelect()
      return
    }
    setIsSelected(true)
    window.setTimeout(onSelect, SELECTION_HOLD_MS)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isSelected}
      className={cn(
        'group relative flex h-full flex-col items-center gap-5 overflow-hidden rounded-[2rem] border bg-background/60 px-10 py-12 text-center backdrop-blur-sm transition-all duration-300 ease-out',
        'shadow-sm hover:-translate-y-1 hover:shadow-xl',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isSelected ? 'scale-[1.02] border-primary shadow-xl' : 'border-border hover:border-foreground/20',
      )}
    >
      {/* Soft hover glow — pure CSS (group-hover), no JS state needed for
          hover itself. Layers under the selection glow below. */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-foreground/[0.04] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden="true"
      />

      {/* Selection glow — soft, blue-accented, fades in only once selected. */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 -z-10 rounded-[2rem] bg-primary/[0.05] blur-2xl transition-opacity duration-300',
          isSelected ? 'opacity-100' : 'opacity-0',
        )}
        aria-hidden="true"
      />

      {illustration ?? (
        <span className="text-6xl" aria-hidden="true">
          {emoji}
        </span>
      )}

      <div>
        <p className={TYPOGRAPHY.h2}>{title}</p>
        <p className={cn(TYPOGRAPHY.bodyLarge, 'mt-3 text-muted-foreground')}>{subtitle}</p>
      </div>

      {formats !== undefined && (
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {formats.map((format) => (
            <span
              key={format.label}
              className={cn(TYPOGRAPHY.caption, 'flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-4 py-1.5')}
            >
              <span aria-hidden="true">{format.emoji}</span>
              {format.label}
            </span>
          ))}
        </div>
      )}

      {flowSteps !== undefined && (
        <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-2.5">
          {flowSteps.map((stepLabel, index) => (
            <span key={stepLabel} className="flex items-center gap-1.5">
              <span className={cn(TYPOGRAPHY.caption, 'rounded-full border border-border/60 bg-muted/30 px-3.5 py-1.5')}>{stepLabel}</span>
              {index < flowSteps.length - 1 && (
                <span className="text-muted-foreground/50" aria-hidden="true">
                  →
                </span>
              )}
            </span>
          ))}
        </div>
      )}

      {ctaLabel !== undefined && <p className={cn(TYPOGRAPHY.h4, 'mt-auto pt-3 text-primary')}>{ctaLabel}</p>}
    </button>
  )
}
